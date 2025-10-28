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
	Contractor      *UserInfo          `json:"contractor,omitempty"`
	RecentPhotos    []ProjectPhoto     `json:"recent_photos"`
	LatestUpdates   []UpdateWithPhotos `json:"latest_updates"`
	WorkLogsSummary WorkLogsSummary    `json:"work_logs_summary"`
	RecentCheckIns  []CheckInInfo      `json:"recent_check_ins"`
	ExpenseSummary  ExpenseSummary     `json:"expense_summary"`
	RecentExpenses  []RecentExpense    `json:"recent_expenses"`
}

type UserInfo struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Email string  `json:"email"`
	Phone *string `json:"phone,omitempty"`
}

type ProjectPhoto struct {
	ID        string    `json:"id"`
	PhotoURL  string    `json:"photo_url"`
	Caption   *string   `json:"caption,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateWithPhotos struct {
	ID          string        `json:"id"`
	UpdateType  string        `json:"update_type"`
	Content     string        `json:"content"`
	CreatorName string        `json:"creator_name"`
	CreatedAt   time.Time     `json:"created_at"`
	Photos      []UpdatePhoto `json:"photos"`
}

type UpdatePhoto struct {
	ID           string    `json:"id"`
	PhotoURL     string    `json:"photo_url"`
	Caption      *string   `json:"caption,omitempty"`
	DisplayOrder int       `json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}

type WorkLogsSummary struct {
	TotalHoursThisWeek float64 `json:"total_hours_this_week"`
	ActiveEmployees    int     `json:"active_employees"`
}

type CheckInInfo struct {
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
	Vendor          *string   `json:"vendor,omitempty"`
	Date            string    `json:"date"`
	Category        string    `json:"category"`
	Description     *string   `json:"description,omitempty"`
	PaidBy          string    `json:"paid_by"`
	ReceiptPhotoURL *string   `json:"receipt_photo_url,omitempty"`
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
	isEmployee := false
	switch models.UserType(userCtx.UserType) {
	case models.UserTypeHouseOwner:
		hasAccess = project.OwnerID == userCtx.UserID
	case models.UserTypeContractor:
		hasAccess = project.ContractorID != nil && *project.ContractorID == userCtx.UserID
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

	if project.ContractorID != nil {
		var contractor UserInfo
		db.QueryRow(`SELECT id, name, email, phone FROM users WHERE id = $1`, *project.ContractorID).
			Scan(&contractor.ID, &contractor.Name, &contractor.Email, &contractor.Phone)
		dashboard.Contractor = &contractor
	}

	photoRows, err := db.Query(`
		SELECT id, photo_url, caption, created_at 
		FROM project_photos 
		WHERE project_id = $1 
		ORDER BY created_at DESC 
		LIMIT 6
	`, projectID)
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
			SELECT COALESCE(SUM(wl.hours_worked), 0), COUNT(DISTINCT wl.employee_id)
			FROM work_logs wl
		`
		workLogArgs := []interface{}{projectID}
		argIndex := 2

		if contractorFilter != "" {
			workLogQuery += `
				JOIN employees e ON wl.employee_id = e.user_id
				WHERE wl.project_id = $1 
				AND e.contractor_id = $` + strconv.Itoa(argIndex) +
				` AND wl.check_in_time >= date_trunc('week', NOW())
			`
			workLogArgs = append(workLogArgs, contractorFilter)
		} else {
			workLogQuery += `
				WHERE wl.project_id = $1 
				AND wl.check_in_time >= date_trunc('week', NOW())
			`
		}

		db.QueryRow(workLogQuery, workLogArgs...).Scan(
			&dashboard.WorkLogsSummary.TotalHoursThisWeek,
			&dashboard.WorkLogsSummary.ActiveEmployees,
		)

		checkInQuery := `
			SELECT wl.id, u.name, wl.check_in_time, wl.check_in_photo_url
			FROM work_logs wl
			JOIN users u ON wl.employee_id = u.id
		`
		checkInArgs := []interface{}{projectID}
		checkInArgIndex := 2

		if contractorFilter != "" {
			checkInQuery += `
				JOIN employees e ON wl.employee_id = e.user_id
				WHERE wl.project_id = $1 
				AND e.contractor_id = $` + strconv.Itoa(checkInArgIndex) +
				` ORDER BY wl.check_in_time DESC LIMIT 5
			`
			checkInArgs = append(checkInArgs, contractorFilter)
		} else {
			checkInQuery += `
				WHERE wl.project_id = $1 
				ORDER BY wl.check_in_time DESC LIMIT 5
			`
		}

		checkInRows, err := db.Query(checkInQuery, checkInArgs...)
		if err == nil {
			defer checkInRows.Close()
			for checkInRows.Next() {
				var checkIn CheckInInfo
				checkInRows.Scan(&checkIn.ID, &checkIn.EmployeeName, &checkIn.CheckInTime, &checkIn.CheckInPhotoURL)
				dashboard.RecentCheckIns = append(dashboard.RecentCheckIns, checkIn)
			}
		}

		expenseQuery := `
			SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = $1
		`
		expenseArgs := []interface{}{projectID}
		expenseArgIndex := 2

		if contractorFilter != "" {
			expenseQuery += ` AND (added_by = $` + strconv.Itoa(expenseArgIndex) +
				` OR added_by IN (SELECT user_id FROM employees WHERE contractor_id = $` + strconv.Itoa(expenseArgIndex) + `))`
			expenseArgs = append(expenseArgs, contractorFilter)
			expenseArgIndex++
		}

		var totalSpent float64
		db.QueryRow(expenseQuery, expenseArgs...).Scan(&totalSpent)

		var totalByOwner, totalByContractor float64
		ownerQuery := expenseQuery + ` AND paid_by = 'owner'`
		contractorQuery := expenseQuery + ` AND paid_by = 'contractor'`

		db.QueryRow(ownerQuery, expenseArgs...).Scan(&totalByOwner)
		db.QueryRow(contractorQuery, expenseArgs...).Scan(&totalByContractor)

		byCategory := make(map[string]float64)
		catQuery := `
			SELECT category, COALESCE(SUM(amount), 0)
			FROM expenses
			WHERE project_id = $1
		`
		catArgs := []interface{}{projectID}

		if contractorFilter != "" {
			catQuery += ` AND (added_by = $2 OR added_by IN (SELECT user_id FROM employees WHERE contractor_id = $2))`
			catArgs = append(catArgs, contractorFilter)
		}

		catQuery += ` GROUP BY category`

		catRows, err := db.Query(catQuery, catArgs...)
		if err == nil {
			defer catRows.Close()
			for catRows.Next() {
				var category string
				var amount float64
				catRows.Scan(&category, &amount)
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

// func GetProjectDashboard(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	vars := mux.Vars(r)
// 	projectID := vars["id"]

// 	db := database.GetDB()

// 	var project models.Project
// 	err := db.QueryRow(`
// 		SELECT id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
// 		FROM projects WHERE id = $1
// 	`, projectID).Scan(
// 		&project.ID,
// 		&project.OwnerID,
// 		&project.ContractorID,
// 		&project.Title,
// 		&project.Description,
// 		&project.EstimatedCost,
// 		&project.Address,
// 		&project.Status,
// 		&project.CreatedAt,
// 		&project.UpdatedAt,
// 	)

// 	if err == sql.ErrNoRows {
// 		respondWithError(w, http.StatusNotFound, "Project not found")
// 		return
// 	}
// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
// 		return
// 	}

// 	hasAccess := false
// 	isEmployee := false
// 	switch models.UserType(userCtx.UserType) {
// 	case models.UserTypeHouseOwner:
// 		hasAccess = project.OwnerID == userCtx.UserID
// 	case models.UserTypeContractor:
// 		hasAccess = project.ContractorID != nil && *project.ContractorID == userCtx.UserID
// 	case models.UserTypeEmployee:
// 		var employeeAccess bool
// 		db.QueryRow(`
// 			SELECT EXISTS(SELECT 1 FROM employee_projects WHERE employee_id = $1 AND project_id = $2)
// 		`, userCtx.UserID, projectID).Scan(&employeeAccess)
// 		hasAccess = employeeAccess
// 		isEmployee = employeeAccess
// 	}

// 	if !hasAccess {
// 		respondWithError(w, http.StatusForbidden, "You don't have access to this project")
// 		return
// 	}

// 	dashboard := ProjectDashboard{
// 		Project: project,
// 	}

// 	var ownerInfo UserInfo
// 	err = db.QueryRow(`
// 		SELECT id, name, email, phone FROM users WHERE id = $1
// 	`, project.OwnerID).Scan(&ownerInfo.ID, &ownerInfo.Name, &ownerInfo.Email, &ownerInfo.Phone)
// 	if err == nil {
// 		dashboard.OwnerInfo = ownerInfo
// 	}

// 	if project.ContractorID != nil {
// 		var contractorInfo UserInfo
// 		err = db.QueryRow(`
// 			SELECT id, name, email, phone FROM users WHERE id = $1
// 		`, *project.ContractorID).Scan(&contractorInfo.ID, &contractorInfo.Name, &contractorInfo.Email, &contractorInfo.Phone)
// 		if err == nil {
// 			dashboard.Contractor = &contractorInfo
// 		}
// 	}

// 	if !isEmployee {
// 		rows, err := db.Query(`
// 			SELECT id, photo_url, caption, created_at
// 			FROM project_photos
// 			WHERE project_id = $1
// 			ORDER BY created_at DESC
// 			LIMIT 10
// 		`, projectID)
// 		if err == nil {
// 			defer rows.Close()
// 			for rows.Next() {
// 				var photo ProjectPhoto
// 				rows.Scan(&photo.ID, &photo.PhotoURL, &photo.Caption, &photo.CreatedAt)
// 				dashboard.RecentPhotos = append(dashboard.RecentPhotos, photo)
// 			}
// 		}

// 		updateRows, err := db.Query(`
// 			SELECT pu.id, pu.update_type, pu.content, u.name, pu.created_at
// 			FROM project_updates pu
// 			JOIN users u ON pu.created_by = u.id
// 			WHERE pu.project_id = $1
// 			ORDER BY pu.created_at DESC
// 			LIMIT 5
// 		`, projectID)
// 		if err == nil {
// 			defer updateRows.Close()
// 			for updateRows.Next() {
// 				var update UpdateWithPhotos
// 				updateRows.Scan(&update.ID, &update.UpdateType, &update.Content, &update.CreatorName, &update.CreatedAt)

// 				photoRows, err := db.Query(`
// 					SELECT id, photo_url, caption, display_order, created_at
// 					FROM project_update_photos
// 					WHERE project_update_id = $1
// 					ORDER BY display_order ASC, created_at ASC
// 				`, update.ID)
// 				if err == nil {
// 					for photoRows.Next() {
// 						var photo UpdatePhoto
// 						photoRows.Scan(&photo.ID, &photo.PhotoURL, &photo.Caption, &photo.DisplayOrder, &photo.CreatedAt)
// 						update.Photos = append(update.Photos, photo)
// 					}
// 					photoRows.Close()
// 				}

// 				dashboard.LatestUpdates = append(dashboard.LatestUpdates, update)
// 			}
// 		}
// 	}

// 	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
// 	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, weekStart.Location())

// 	if isEmployee {
// 		var totalHours float64
// 		db.QueryRow(`
// 			SELECT COALESCE(SUM(hours_worked), 0)
// 			FROM work_logs
// 			WHERE project_id = $1 AND employee_id = $2 AND check_in_time >= $3
// 		`, projectID, userCtx.UserID, weekStart).Scan(&totalHours)

// 		dashboard.WorkLogsSummary = WorkLogsSummary{
// 			TotalHoursThisWeek: totalHours,
// 			ActiveEmployees:    1,
// 		}

// 		checkInRows, err := db.Query(`
// 			SELECT wl.id, u.name, wl.check_in_time, wl.check_in_photo_url
// 			FROM work_logs wl
// 			JOIN users u ON wl.employee_id = u.id
// 			WHERE wl.project_id = $1 AND wl.employee_id = $2
// 			ORDER BY wl.check_in_time DESC
// 			LIMIT 5
// 		`, projectID, userCtx.UserID)
// 		if err == nil {
// 			defer checkInRows.Close()
// 			for checkInRows.Next() {
// 				var checkIn CheckInInfo
// 				checkInRows.Scan(&checkIn.ID, &checkIn.EmployeeName, &checkIn.CheckInTime, &checkIn.CheckInPhotoURL)
// 				dashboard.RecentCheckIns = append(dashboard.RecentCheckIns, checkIn)
// 			}
// 		}
// 	} else {
// 		var totalHours float64
// 		var employeeCount int
// 		db.QueryRow(`
// 			SELECT COALESCE(SUM(hours_worked), 0), COUNT(DISTINCT employee_id)
// 			FROM work_logs
// 			WHERE project_id = $1 AND check_in_time >= $2
// 		`, projectID, weekStart).Scan(&totalHours, &employeeCount)

// 		dashboard.WorkLogsSummary = WorkLogsSummary{
// 			TotalHoursThisWeek: totalHours,
// 			ActiveEmployees:    employeeCount,
// 		}

// 		checkInRows, err := db.Query(`
// 			SELECT wl.id, u.name, wl.check_in_time, wl.check_in_photo_url
// 			FROM work_logs wl
// 			JOIN users u ON wl.employee_id = u.id
// 			WHERE wl.project_id = $1
// 			ORDER BY wl.check_in_time DESC
// 			LIMIT 5
// 		`, projectID)
// 		if err == nil {
// 			defer checkInRows.Close()
// 			for checkInRows.Next() {
// 				var checkIn CheckInInfo
// 				checkInRows.Scan(&checkIn.ID, &checkIn.EmployeeName, &checkIn.CheckInTime, &checkIn.CheckInPhotoURL)
// 				dashboard.RecentCheckIns = append(dashboard.RecentCheckIns, checkIn)
// 			}
// 		}

// 		var totalSpent float64
// 		db.QueryRow(`
// 			SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = $1
// 		`, projectID).Scan(&totalSpent)

// 		var totalByOwner, totalByContractor float64
// 		db.QueryRow(`
// 			SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = $1 AND paid_by = 'owner'
// 		`, projectID).Scan(&totalByOwner)

// 		db.QueryRow(`
// 			SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = $1 AND paid_by = 'contractor'
// 		`, projectID).Scan(&totalByContractor)

// 		byCategory := make(map[string]float64)
// 		catRows, err := db.Query(`
// 			SELECT category, COALESCE(SUM(amount), 0)
// 			FROM expenses
// 			WHERE project_id = $1
// 			GROUP BY category
// 		`, projectID)
// 		if err == nil {
// 			defer catRows.Close()
// 			for catRows.Next() {
// 				var category string
// 				var amount float64
// 				catRows.Scan(&category, &amount)
// 				byCategory[category] = amount
// 			}
// 		}

// 		dashboard.ExpenseSummary = ExpenseSummary{
// 			TotalSpent:        totalSpent,
// 			TotalByOwner:      totalByOwner,
// 			TotalByContractor: totalByContractor,
// 			ByCategory:        byCategory,
// 		}

// 		expRows, err := db.Query(`
// 			SELECT e.id, e.amount, e.vendor, e.date, e.category, e.description,
// 			       e.paid_by, e.receipt_photo_url, u.name, e.created_at
// 			FROM expenses e
// 			JOIN users u ON e.added_by = u.id
// 			WHERE e.project_id = $1
// 			ORDER BY e.created_at DESC
// 			LIMIT 5
// 		`, projectID)
// 		if err == nil {
// 			defer expRows.Close()
// 			for expRows.Next() {
// 				var expense RecentExpense
// 				expRows.Scan(&expense.ID, &expense.Amount, &expense.Vendor, &expense.Date,
// 					&expense.Category, &expense.Description, &expense.PaidBy,
// 					&expense.ReceiptPhotoURL, &expense.AddedByName, &expense.CreatedAt)
// 				dashboard.RecentExpenses = append(dashboard.RecentExpenses, expense)
// 			}
// 		}
// 	}

// 	respondWithJSON(w, http.StatusOK, dashboard)
// }
