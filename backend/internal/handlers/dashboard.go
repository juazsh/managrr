package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
)

type ProjectDashboard struct {
	Project         models.Project     `json:"project"`
	OwnerInfo       UserInfo           `json:"owner_info"`
	RecentPhotos    []ProjectPhoto     `json:"recent_photos"`
	LatestUpdates   []UpdateWithPhotos `json:"latest_updates"`
	WorkLogsSummary WorkLogsSummary    `json:"work_logs_summary"`
	RecentCheckIns  []RecentCheckIn    `json:"recent_check_ins"`
	ExpenseSummary  ExpenseSummary     `json:"expense_summary"`
	RecentExpenses  []RecentExpense    `json:"recent_expenses"`
}

type UserInfo struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Email string  `json:"email"`
	Phone *string `json:"phone"`
}

type ProjectPhoto struct {
	ID        string    `json:"id"`
	PhotoURL  string    `json:"photo_url"`
	Caption   *string   `json:"caption"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateWithPhotos struct {
	ID          string        `json:"id"`
	UpdateType  string        `json:"update_type"`
	Content     string        `json:"content"`
	CreatorName string        `json:"creator_name"`
	Photos      []UpdatePhoto `json:"photos"`
	CreatedAt   time.Time     `json:"created_at"`
}

type UpdatePhoto struct {
	ID           string    `json:"id"`
	PhotoURL     string    `json:"photo_url"`
	Caption      *string   `json:"caption"`
	DisplayOrder int       `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}

type WorkLogsSummary struct {
	TotalHoursThisWeek float64 `json:"total_hours_this_week"`
	ActiveEmployees    int     `json:"active_employees"`
}

type RecentCheckIn struct {
	ID              string    `json:"id"`
	EmployeeName    string    `json:"employee_name"`
	CheckInTime     time.Time `json:"check_in_time"`
	CheckInPhotoURL string    `json:"check_in_photo_url"`
}

type ExpenseSummary struct {
	TotalSpent        float64            `json:"total_spent"`
	TotalByOwner      float64            `json:"total_by_owner"`
	TotalByContractor float64            `json:"total_by_contractor"`
	ByCategory        map[string]float64 `json:"by_category"`
}

type RecentExpense struct {
	ID              string    `json:"id"`
	Amount          float64   `json:"amount"`
	Vendor          string    `json:"vendor"`
	Date            string    `json:"date"`
	Category        string    `json:"category"`
	Description     *string   `json:"description"`
	PaidBy          string    `json:"paid_by"`
	ReceiptPhotoURL *string   `json:"receipt_photo_url"`
	AddedByName     string    `json:"added_by_name"`
	CreatedAt       time.Time `json:"created_at"`
}

func GetProjectDashboard(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]
	contractorFilter := r.URL.Query().Get("contractor_id")

	db := database.GetDB()

	var project models.Project
	err := db.QueryRow(`
		SELECT id, owner_id, title, description, estimated_cost, address, status, created_at, updated_at
		FROM projects WHERE id = $1
	`, projectID).Scan(
		&project.ID,
		&project.OwnerID,
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
	isEmployee := false
	switch models.UserType(userCtx.UserType) {
	case models.UserTypeHouseOwner:
		hasAccess = project.OwnerID == userCtx.UserID
	case models.UserTypeContractor:
		var isInProjectContractors bool
		err = db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM project_contractors 
				WHERE project_id = $1 AND contractor_id = $2
			)
		`, projectID, userCtx.UserID).Scan(&isInProjectContractors)
		if err == nil && isInProjectContractors {
			hasAccess = true
		}
	case models.UserTypeEmployee:
		var employeeAccess bool
		db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM employee_projects WHERE project_id = $1 AND employee_id = $2)
		`, projectID, userCtx.UserID).Scan(&employeeAccess)
		hasAccess = employeeAccess
		isEmployee = employeeAccess
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	var dashboard ProjectDashboard
	dashboard.Project = project

	var ownerInfo UserInfo
	db.QueryRow(`SELECT id, name, email, phone FROM users WHERE id = $1`, project.OwnerID).
		Scan(&ownerInfo.ID, &ownerInfo.Name, &ownerInfo.Email, &ownerInfo.Phone)
	dashboard.OwnerInfo = ownerInfo

	photoQuery := `
		SELECT id, photo_url, caption, created_at 
		FROM project_photos 
		WHERE project_id = $1`
	photoArgs := []interface{}{projectID}

	if contractorFilter != "" {
		photoQuery += ` AND uploaded_by = $2`
		photoArgs = append(photoArgs, contractorFilter)
	}

	photoQuery += ` ORDER BY created_at DESC LIMIT 6`

	photoRows, err := db.Query(photoQuery, photoArgs...)
	if err == nil {
		defer photoRows.Close()
		for photoRows.Next() {
			var photo ProjectPhoto
			photoRows.Scan(&photo.ID, &photo.PhotoURL, &photo.Caption, &photo.CreatedAt)
			dashboard.RecentPhotos = append(dashboard.RecentPhotos, photo)
		}
	}

	updateRows, err := db.Query(`
		SELECT pu.id, pu.update_type, pu.content, u.name, pu.created_at
		FROM project_updates pu
		JOIN users u ON pu.created_by = u.id
		WHERE pu.project_id = $1
		ORDER BY pu.created_at DESC
		LIMIT 5
	`, projectID)
	if err == nil {
		defer updateRows.Close()
		for updateRows.Next() {
			var update UpdateWithPhotos
			updateRows.Scan(&update.ID, &update.UpdateType, &update.Content, &update.CreatorName, &update.CreatedAt)

			photoRows, _ := db.Query(`
				SELECT id, photo_url, caption, display_order, created_at
				FROM project_update_photos
				WHERE project_update_id = $1
				ORDER BY display_order
			`, update.ID)
			if photoRows != nil {
				defer photoRows.Close()
				for photoRows.Next() {
					var photo UpdatePhoto
					photoRows.Scan(&photo.ID, &photo.PhotoURL, &photo.Caption, &photo.DisplayOrder, &photo.CreatedAt)
					update.Photos = append(update.Photos, photo)
				}
			}
			dashboard.LatestUpdates = append(dashboard.LatestUpdates, update)
		}
	}

	if !isEmployee {
		workLogQuery := `
			SELECT 
				COALESCE(SUM(EXTRACT(EPOCH FROM (check_out_time - check_in_time))/3600), 0) as total_hours,
				COUNT(DISTINCT employee_id) as active_employees
			FROM work_logs
			WHERE project_id = $1 
			AND check_in_time >= NOW() - INTERVAL '7 days'
			AND check_out_time IS NOT NULL
		`
		workLogArgs := []interface{}{projectID}
		argIndex := 2

		if contractorFilter != "" {
			workLogQuery += ` AND employee_id IN (SELECT user_id FROM employees WHERE contractor_id = $` + strconv.Itoa(argIndex) + `)`
			workLogArgs = append(workLogArgs, contractorFilter)
		}

		var totalHours float64
		var activeEmployees int
		db.QueryRow(workLogQuery, workLogArgs...).Scan(&totalHours, &activeEmployees)

		dashboard.WorkLogsSummary = WorkLogsSummary{
			TotalHoursThisWeek: totalHours,
			ActiveEmployees:    activeEmployees,
		}

		checkInQuery := `
			SELECT wl.id, u.name, wl.check_in_time, wl.check_in_photo_url
			FROM work_logs wl
			JOIN users u ON wl.employee_id = u.id
			WHERE wl.project_id = $1
		`
		checkInArgs := []interface{}{projectID}
		argIndex = 2

		if contractorFilter != "" {
			checkInQuery += ` AND wl.employee_id IN (SELECT user_id FROM employees WHERE contractor_id = $` + strconv.Itoa(argIndex) + `)`
			checkInArgs = append(checkInArgs, contractorFilter)
		}

		checkInQuery += ` ORDER BY wl.check_in_time DESC LIMIT 5`

		checkInRows, err := db.Query(checkInQuery, checkInArgs...)
		if err == nil {
			defer checkInRows.Close()
			for checkInRows.Next() {
				var checkIn RecentCheckIn
				checkInRows.Scan(&checkIn.ID, &checkIn.EmployeeName, &checkIn.CheckInTime, &checkIn.CheckInPhotoURL)
				dashboard.RecentCheckIns = append(dashboard.RecentCheckIns, checkIn)
			}
		}

		expenseQuery := `
			SELECT 
				COALESCE(SUM(amount), 0) as total_spent,
				COALESCE(SUM(CASE WHEN paid_by = 'owner' THEN amount ELSE 0 END), 0) as total_by_owner,
				COALESCE(SUM(CASE WHEN paid_by = 'contractor' THEN amount ELSE 0 END), 0) as total_by_contractor
			FROM expenses
		`
		expenseArgs := []interface{}{projectID}
		argIndex = 2

		if contractorFilter != "" {
			expenseQuery += ` 
				WHERE project_id = $1 
				AND (added_by = $` + strconv.Itoa(argIndex) +
				` OR added_by IN (SELECT user_id FROM employees WHERE contractor_id = $` + strconv.Itoa(argIndex) + `))`
			expenseArgs = append(expenseArgs, contractorFilter)
		} else {
			expenseQuery += ` WHERE project_id = $1`
		}

		var totalSpent, totalByOwner, totalByContractor float64
		db.QueryRow(expenseQuery, expenseArgs...).Scan(&totalSpent, &totalByOwner, &totalByContractor)

		byCategoryQuery := `
			SELECT category, COALESCE(SUM(amount), 0)
			FROM expenses
		`
		byCategoryArgs := []interface{}{projectID}
		argIndex = 2

		if contractorFilter != "" {
			byCategoryQuery += ` 
				WHERE project_id = $1 
				AND (added_by = $` + strconv.Itoa(argIndex) +
				` OR added_by IN (SELECT user_id FROM employees WHERE contractor_id = $` + strconv.Itoa(argIndex) + `))
				GROUP BY category`
			byCategoryArgs = append(byCategoryArgs, contractorFilter)
		} else {
			byCategoryQuery += ` WHERE project_id = $1 GROUP BY category`
		}

		categoryRows, err := db.Query(byCategoryQuery, byCategoryArgs...)
		byCategory := make(map[string]float64)
		if err == nil {
			defer categoryRows.Close()
			for categoryRows.Next() {
				var category string
				var amount float64
				categoryRows.Scan(&category, &amount)
				byCategory[category] = amount
			}
		}

		dashboard.ExpenseSummary = ExpenseSummary{
			TotalSpent:        totalSpent,
			TotalByOwner:      totalByOwner,
			TotalByContractor: totalByContractor,
			ByCategory:        byCategory,
		}

		expListQuery := `
			SELECT e.id, e.amount, e.vendor, e.date, e.category, e.description, 
			       e.paid_by, e.receipt_photo_url, u.name, e.created_at
			FROM expenses e
			JOIN users u ON e.added_by = u.id
			WHERE e.project_id = $1
		`
		expListArgs := []interface{}{projectID}

		if contractorFilter != "" {
			expListQuery += ` AND (e.added_by = $2 OR e.added_by IN (SELECT user_id FROM employees WHERE contractor_id = $2))`
			expListArgs = append(expListArgs, contractorFilter)
		}

		expListQuery += ` ORDER BY e.created_at DESC LIMIT 5`

		expRows, err := db.Query(expListQuery, expListArgs...)
		if err == nil {
			defer expRows.Close()
			for expRows.Next() {
				var expense RecentExpense
				expRows.Scan(&expense.ID, &expense.Amount, &expense.Vendor, &expense.Date,
					&expense.Category, &expense.Description, &expense.PaidBy,
					&expense.ReceiptPhotoURL, &expense.AddedByName, &expense.CreatedAt)
				dashboard.RecentExpenses = append(dashboard.RecentExpenses, expense)
			}
		}
	}

	respondWithJSON(w, http.StatusOK, dashboard)
}
