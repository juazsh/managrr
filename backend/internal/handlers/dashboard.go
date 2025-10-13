package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
)

type ProjectDashboard struct {
	Project         models.Project  `json:"project"`
	Contractor      *ContractorInfo `json:"contractor,omitempty"`
	RecentPhotos    []ProjectPhoto  `json:"recent_photos"`
	LatestUpdates   LatestUpdates   `json:"latest_updates"`
	WorkLogsSummary WorkLogsSummary `json:"work_logs_summary"`
	ExpenseSummary  ExpenseSummary  `json:"expense_summary"`
	RecentExpenses  []RecentExpense `json:"recent_expenses"`
}

type ContractorInfo struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type ProjectPhoto struct {
	ID        string    `json:"id"`
	PhotoURL  string    `json:"photo_url"`
	Caption   *string   `json:"caption,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type LatestUpdates struct {
	DailySummary *ProjectUpdate `json:"daily_summary,omitempty"`
	WeeklyPlan   *ProjectUpdate `json:"weekly_plan,omitempty"`
}

type ProjectUpdate struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

type WorkLogsSummary struct {
	TotalHoursThisWeek float64 `json:"total_hours_this_week"`
	EmployeeCount      int     `json:"employee_count"`
}

type ExpenseSummary struct {
	TotalSpent float64            `json:"total_spent"`
	ByCategory map[string]float64 `json:"by_category"`
	ByPayer    map[string]float64 `json:"by_payer"`
}

type RecentExpense struct {
	ID          string    `json:"id"`
	Amount      float64   `json:"amount"`
	Vendor      string    `json:"vendor"`
	Date        time.Time `json:"date"`
	Category    string    `json:"category"`
	Description *string   `json:"description,omitempty"`
	PaidBy      string    `json:"paid_by"`
}

func GetProjectDashboard(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var project models.Project
	err := db.QueryRow(`
		SELECT id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
		FROM projects WHERE id = $1
	`, projectID).Scan(
		&project.ID,
		&project.OwnerID,
		&project.ContractorID,
		&project.Title,
		&project.Description,
		&project.EstimatedCost,
		&project.Address,
		&project.Status,
		&project.CreatedAt,
		&project.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	hasAccess := false
	switch models.UserType(userCtx.UserType) {
	case models.UserTypeHouseOwner:
		hasAccess = project.OwnerID == userCtx.UserID
	case models.UserTypeContractor:
		hasAccess = project.ContractorID != nil && *project.ContractorID == userCtx.UserID
	case models.UserTypeEmployee:
		var employeeAccess bool
		db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM employee_projects WHERE employee_id = $1 AND project_id = $2)
		`, userCtx.UserID, projectID).Scan(&employeeAccess)
		hasAccess = employeeAccess
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "You don't have access to this project")
		return
	}

	dashboard := ProjectDashboard{
		Project: project,
	}

	if project.ContractorID != nil {
		var contractor ContractorInfo
		err = db.QueryRow(`
			SELECT id, name, email, phone FROM users WHERE id = $1
		`, *project.ContractorID).Scan(&contractor.ID, &contractor.Name, &contractor.Email, &contractor.Phone)
		if err == nil {
			dashboard.Contractor = &contractor
		}
	}

	rows, err := db.Query(`
		SELECT id, photo_url, caption, created_at
		FROM project_photos
		WHERE project_id = $1
		ORDER BY created_at DESC
		LIMIT 10
	`, projectID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var photo ProjectPhoto
			rows.Scan(&photo.ID, &photo.PhotoURL, &photo.Caption, &photo.CreatedAt)
			dashboard.RecentPhotos = append(dashboard.RecentPhotos, photo)
		}
	}

	var dailySummary ProjectUpdate
	err = db.QueryRow(`
		SELECT id, content, created_by, created_at
		FROM project_updates
		WHERE project_id = $1 AND update_type = 'daily_summary'
		ORDER BY created_at DESC
		LIMIT 1
	`, projectID).Scan(&dailySummary.ID, &dailySummary.Content, &dailySummary.CreatedBy, &dailySummary.CreatedAt)
	if err == nil {
		dashboard.LatestUpdates.DailySummary = &dailySummary
	}

	var weeklyPlan ProjectUpdate
	err = db.QueryRow(`
		SELECT id, content, created_by, created_at
		FROM project_updates
		WHERE project_id = $1 AND update_type = 'weekly_plan'
		ORDER BY created_at DESC
		LIMIT 1
	`, projectID).Scan(&weeklyPlan.ID, &weeklyPlan.Content, &weeklyPlan.CreatedBy, &weeklyPlan.CreatedAt)
	if err == nil {
		dashboard.LatestUpdates.WeeklyPlan = &weeklyPlan
	}

	var totalHours float64
	var employeeCount int
	db.QueryRow(`
		SELECT COALESCE(SUM(hours_worked), 0), COUNT(DISTINCT employee_id)
		FROM work_logs
		WHERE project_id = $1 AND check_in_time >= NOW() - INTERVAL '7 days'
	`, projectID).Scan(&totalHours, &employeeCount)
	dashboard.WorkLogsSummary = WorkLogsSummary{
		TotalHoursThisWeek: totalHours,
		EmployeeCount:      employeeCount,
	}

	var totalSpent float64
	db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = $1
	`, projectID).Scan(&totalSpent)

	byCategory := make(map[string]float64)
	catRows, err := db.Query(`
		SELECT category, COALESCE(SUM(amount), 0)
		FROM expenses
		WHERE project_id = $1
		GROUP BY category
	`, projectID)
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var category string
			var amount float64
			catRows.Scan(&category, &amount)
			byCategory[category] = amount
		}
	}

	byPayer := make(map[string]float64)
	payerRows, err := db.Query(`
		SELECT paid_by, COALESCE(SUM(amount), 0)
		FROM expenses
		WHERE project_id = $1
		GROUP BY paid_by
	`, projectID)
	if err == nil {
		defer payerRows.Close()
		for payerRows.Next() {
			var payer string
			var amount float64
			payerRows.Scan(&payer, &amount)
			byPayer[payer] = amount
		}
	}

	dashboard.ExpenseSummary = ExpenseSummary{
		TotalSpent: totalSpent,
		ByCategory: byCategory,
		ByPayer:    byPayer,
	}

	expRows, err := db.Query(`
		SELECT id, amount, vendor, date, category, description, paid_by
		FROM expenses
		WHERE project_id = $1
		ORDER BY date DESC
		LIMIT 5
	`, projectID)
	if err == nil {
		defer expRows.Close()
		for expRows.Next() {
			var expense RecentExpense
			expRows.Scan(&expense.ID, &expense.Amount, &expense.Vendor, &expense.Date, &expense.Category, &expense.Description, &expense.PaidBy)
			dashboard.RecentExpenses = append(dashboard.RecentExpenses, expense)
		}
	}

	respondWithJSON(w, http.StatusOK, dashboard)
}
