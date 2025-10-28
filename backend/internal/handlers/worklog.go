package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
)

func CheckIn(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeEmployee) {
		respondWithError(w, http.StatusForbidden, "Only employees can check in")
		return
	}

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	projectIDStr := r.FormValue("project_id")
	if projectIDStr == "" {
		respondWithError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Photo file is required")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		respondWithError(w, http.StatusBadRequest, "Only JPG, JPEG, and PNG files are allowed")
		return
	}

	if header.Size > maxFileSize {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	db := database.GetDB()

	var assigned bool
	err = db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM employee_projects 
			WHERE employee_id = $1 AND project_id = $2
		)
	`, userCtx.UserID, projectID).Scan(&assigned)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project assignment")
		return
	}

	if !assigned {
		respondWithError(w, http.StatusForbidden, "You are not assigned to this project")
		return
	}

	var hasActiveCheckIn bool
	err = db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM work_logs 
			WHERE employee_id = $1 AND project_id = $2 AND check_out_time IS NULL
		)
	`, userCtx.UserID, projectID).Scan(&hasActiveCheckIn)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check active work log")
		return
	}

	if hasActiveCheckIn {
		respondWithError(w, http.StatusBadRequest, "You are already checked in to this project")
		return
	}

	supabaseStorage := storage.NewSupabaseStorage()
	photoURL, err := supabaseStorage.UploadFile(file, header, userCtx.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to upload photo")
		return
	}

	var latitude, longitude *float64
	if latStr := r.FormValue("latitude"); latStr != "" {
		if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
			latitude = &lat
		}
	}
	if lonStr := r.FormValue("longitude"); lonStr != "" {
		if lon, err := strconv.ParseFloat(lonStr, 64); err == nil {
			longitude = &lon
		}
	}

	var workLog models.WorkLog
	query := `
		INSERT INTO work_logs (
			employee_id, project_id, check_in_time, check_in_photo_url,
			check_in_latitude, check_in_longitude, created_at
		)
		VALUES ($1, $2, NOW(), $3, $4, $5, NOW())
		RETURNING id, employee_id, project_id, check_in_time, check_out_time,
		          check_in_photo_url, check_out_photo_url,
		          check_in_latitude, check_in_longitude,
		          check_out_latitude, check_out_longitude,
		          hours_worked, created_at
	`

	err = db.QueryRow(
		query,
		userCtx.UserID,
		projectID,
		photoURL,
		latitude,
		longitude,
	).Scan(
		&workLog.ID,
		&workLog.EmployeeID,
		&workLog.ProjectID,
		&workLog.CheckInTime,
		&workLog.CheckOutTime,
		&workLog.CheckInPhotoURL,
		&workLog.CheckOutPhotoURL,
		&workLog.CheckInLatitude,
		&workLog.CheckInLongitude,
		&workLog.CheckOutLatitude,
		&workLog.CheckOutLongitude,
		&workLog.HoursWorked,
		&workLog.CreatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create work log")
		return
	}

	respondWithJSON(w, http.StatusCreated, workLog)
}

func CheckOut(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeEmployee) {
		respondWithError(w, http.StatusForbidden, "Only employees can check out")
		return
	}

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	workLogIDStr := r.FormValue("work_log_id")
	if workLogIDStr == "" {
		respondWithError(w, http.StatusBadRequest, "work_log_id is required")
		return
	}

	workLogID, err := strconv.Atoi(workLogIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid work_log_id")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Photo file is required")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		respondWithError(w, http.StatusBadRequest, "Only JPG, JPEG, and PNG files are allowed")
		return
	}

	if header.Size > maxFileSize {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	db := database.GetDB()

	var workLog models.WorkLog
	err = db.QueryRow(`
		SELECT id, employee_id, project_id, check_in_time, check_out_time,
		       check_in_photo_url, check_out_photo_url,
		       check_in_latitude, check_in_longitude,
		       check_out_latitude, check_out_longitude,
		       hours_worked, created_at
		FROM work_logs
		WHERE id = $1
	`, workLogID).Scan(
		&workLog.ID,
		&workLog.EmployeeID,
		&workLog.ProjectID,
		&workLog.CheckInTime,
		&workLog.CheckOutTime,
		&workLog.CheckInPhotoURL,
		&workLog.CheckOutPhotoURL,
		&workLog.CheckInLatitude,
		&workLog.CheckInLongitude,
		&workLog.CheckOutLatitude,
		&workLog.CheckOutLongitude,
		&workLog.HoursWorked,
		&workLog.CreatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusNotFound, "Work log not found")
		return
	}

	if workLog.EmployeeID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "You can only check out from your own work log")
		return
	}

	if workLog.CheckOutTime != nil {
		respondWithError(w, http.StatusBadRequest, "Already checked out from this work log")
		return
	}

	supabaseStorage := storage.NewSupabaseStorage()
	photoURL, err := supabaseStorage.UploadFile(file, header, userCtx.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to upload photo")
		return
	}

	var latitude, longitude *float64
	if latStr := r.FormValue("latitude"); latStr != "" {
		if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
			latitude = &lat
		}
	}
	if lonStr := r.FormValue("longitude"); lonStr != "" {
		if lon, err := strconv.ParseFloat(lonStr, 64); err == nil {
			longitude = &lon
		}
	}

	query := `
		UPDATE work_logs
		SET check_out_time = NOW(),
		    check_out_photo_url = $1,
		    check_out_latitude = $2,
		    check_out_longitude = $3,
		    hours_worked = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in_time)) / 3600, 2)
		WHERE id = $4
		RETURNING id, employee_id, project_id, check_in_time, check_out_time,
		          check_in_photo_url, check_out_photo_url,
		          check_in_latitude, check_in_longitude,
		          check_out_latitude, check_out_longitude,
		          hours_worked, created_at
	`

	err = db.QueryRow(
		query,
		photoURL,
		latitude,
		longitude,
		workLogID,
	).Scan(
		&workLog.ID,
		&workLog.EmployeeID,
		&workLog.ProjectID,
		&workLog.CheckInTime,
		&workLog.CheckOutTime,
		&workLog.CheckInPhotoURL,
		&workLog.CheckOutPhotoURL,
		&workLog.CheckInLatitude,
		&workLog.CheckInLongitude,
		&workLog.CheckOutLatitude,
		&workLog.CheckOutLongitude,
		&workLog.HoursWorked,
		&workLog.CreatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check out")
		return
	}

	respondWithJSON(w, http.StatusOK, workLog)
}

func ListWorkLogs(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	projectID := r.URL.Query().Get("project_id")
	employeeID := r.URL.Query().Get("employee_id")
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	db := database.GetDB()

	var query string
	var args []interface{}
	argCount := 0

	baseQuery := `
		SELECT wl.id, wl.employee_id, wl.project_id, wl.check_in_time, wl.check_out_time,
		       wl.check_in_photo_url, wl.check_out_photo_url,
		       wl.check_in_latitude, wl.check_in_longitude,
		       wl.check_out_latitude, wl.check_out_longitude,
		       wl.hours_worked, wl.created_at,
		       u.name as employee_name, p.title as project_name
		FROM work_logs wl
		JOIN users u ON wl.employee_id = u.id
		JOIN projects p ON wl.project_id = p.id
	`

	var whereClauses []string

	if userCtx.UserType == string(models.UserTypeEmployee) {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("wl.employee_id = $%d", argCount))
		args = append(args, userCtx.UserID)
	} else if userCtx.UserType == string(models.UserTypeContractor) {
		baseQuery += " JOIN employees e ON wl.employee_id = e.user_id"
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("e.contractor_id = $%d", argCount))
		args = append(args, userCtx.UserID)
	} else {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	if projectID != "" {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("wl.project_id = $%d", argCount))
		args = append(args, projectID)
	}

	if employeeID != "" && userCtx.UserType == string(models.UserTypeContractor) {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("wl.employee_id = $%d", argCount))
		args = append(args, employeeID)
	}

	if startDate != "" {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("wl.check_in_time >= $%d", argCount))
		args = append(args, startDate)
	}

	if endDate != "" {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("wl.check_in_time <= $%d", argCount))
		args = append(args, endDate+" 23:59:59")
	}

	if len(whereClauses) > 0 {
		query = baseQuery + " WHERE " + strings.Join(whereClauses, " AND ")
	} else {
		query = baseQuery
	}

	query += " ORDER BY wl.check_in_time DESC"

	log.Printf("INFO ListWorkLogs: Executing query with %d args", len(args))

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("ERROR ListWorkLogs: Failed to fetch work logs: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch work logs")
		return
	}
	defer rows.Close()

	type WorkLogResponse struct {
		models.WorkLog
		EmployeeName string `json:"employee_name"`
		ProjectName  string `json:"project_name"`
	}

	var workLogs []WorkLogResponse
	for rows.Next() {
		var wl WorkLogResponse
		err := rows.Scan(
			&wl.ID,
			&wl.EmployeeID,
			&wl.ProjectID,
			&wl.CheckInTime,
			&wl.CheckOutTime,
			&wl.CheckInPhotoURL,
			&wl.CheckOutPhotoURL,
			&wl.CheckInLatitude,
			&wl.CheckInLongitude,
			&wl.CheckOutLatitude,
			&wl.CheckOutLongitude,
			&wl.HoursWorked,
			&wl.CreatedAt,
			&wl.EmployeeName,
			&wl.ProjectName,
		)
		if err != nil {
			log.Printf("ERROR ListWorkLogs: Failed to scan work log: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to scan work log")
			return
		}
		workLogs = append(workLogs, wl)
	}

	if workLogs == nil {
		workLogs = []WorkLogResponse{}
	}

	respondWithJSON(w, http.StatusOK, workLogs)
}

func GetProjectWorkLogs(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]
	contractorFilter := r.URL.Query().Get("contractor_id")

	db := database.GetDB()

	var hasAccess bool
	if userCtx.UserType == string(models.UserTypeHouseOwner) {
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2)
		`, projectID, userCtx.UserID).Scan(&hasAccess)
		if err != nil || !hasAccess {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	} else if userCtx.UserType == string(models.UserTypeContractor) {
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM project_contractors WHERE project_id = $1 AND contractor_id = $2)
		`, projectID, userCtx.UserID).Scan(&hasAccess)
		if err != nil || !hasAccess {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	} else if userCtx.UserType == string(models.UserTypeEmployee) {
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM employee_projects WHERE project_id = $1 AND employee_id = $2)
		`, projectID, userCtx.UserID).Scan(&hasAccess)
		if err != nil || !hasAccess {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	} else {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT wl.id, wl.employee_id, wl.project_id, wl.check_in_time, wl.check_out_time,
		       wl.check_in_photo_url, wl.check_out_photo_url,
		       wl.check_in_latitude, wl.check_in_longitude,
		       wl.check_out_latitude, wl.check_out_longitude,
		       wl.hours_worked, wl.created_at,
		       u.name as employee_name, p.title as project_name
		FROM work_logs wl
		JOIN users u ON wl.employee_id = u.id
		JOIN projects p ON wl.project_id = p.id
	`

	args := []interface{}{projectID}
	argIndex := 2

	if contractorFilter != "" {
		query += ` JOIN employees e ON wl.employee_id = e.user_id
		WHERE wl.project_id = $1 AND e.contractor_id = $` + strconv.Itoa(argIndex)
		args = append(args, contractorFilter)
	} else {
		query += ` WHERE wl.project_id = $1`
	}

	query += ` ORDER BY wl.check_in_time DESC`

	rows, err := db.Query(query, args...)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch work logs")
		return
	}
	defer rows.Close()

	type WorkLogResponse struct {
		models.WorkLog
		EmployeeName string `json:"employee_name"`
		ProjectName  string `json:"project_name"`
	}

	var workLogs []WorkLogResponse
	for rows.Next() {
		var wl WorkLogResponse
		err := rows.Scan(
			&wl.ID,
			&wl.EmployeeID,
			&wl.ProjectID,
			&wl.CheckInTime,
			&wl.CheckOutTime,
			&wl.CheckInPhotoURL,
			&wl.CheckOutPhotoURL,
			&wl.CheckInLatitude,
			&wl.CheckInLongitude,
			&wl.CheckOutLatitude,
			&wl.CheckOutLongitude,
			&wl.HoursWorked,
			&wl.CreatedAt,
			&wl.EmployeeName,
			&wl.ProjectName,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan work log")
			return
		}
		workLogs = append(workLogs, wl)
	}

	if workLogs == nil {
		workLogs = []WorkLogResponse{}
	}

	respondWithJSON(w, http.StatusOK, workLogs)
}

func GetWorkLogDetail(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	workLogID := vars["id"]

	db := database.GetDB()

	query := `
		SELECT wl.id, wl.employee_id, wl.project_id, wl.check_in_time, wl.check_out_time,
		       wl.check_in_photo_url, wl.check_out_photo_url,
		       wl.check_in_latitude, wl.check_in_longitude,
		       wl.check_out_latitude, wl.check_out_longitude,
		       wl.hours_worked, wl.created_at,
		       u.name as employee_name, p.title as project_title
		FROM work_logs wl
		JOIN users u ON wl.employee_id = u.id
		JOIN projects p ON wl.project_id = p.id
		WHERE wl.id = $1
	`

	type WorkLogDetailResponse struct {
		models.WorkLog
		EmployeeName string `json:"employee_name"`
		ProjectTitle string `json:"project_title"`
	}

	var wl WorkLogDetailResponse
	err := db.QueryRow(query, workLogID).Scan(
		&wl.ID,
		&wl.EmployeeID,
		&wl.ProjectID,
		&wl.CheckInTime,
		&wl.CheckOutTime,
		&wl.CheckInPhotoURL,
		&wl.CheckOutPhotoURL,
		&wl.CheckInLatitude,
		&wl.CheckInLongitude,
		&wl.CheckOutLatitude,
		&wl.CheckOutLongitude,
		&wl.HoursWorked,
		&wl.CreatedAt,
		&wl.EmployeeName,
		&wl.ProjectTitle,
	)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Work log not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch work log")
		return
	}

	if userCtx.UserType == string(models.UserTypeContractor) {
		var hasAccess bool
		err := db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM employees e 
				WHERE e.contractor_id = $1 AND e.user_id = $2
			)
		`, userCtx.UserID, wl.EmployeeID).Scan(&hasAccess)

		if err != nil || !hasAccess {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	} else if userCtx.UserType == string(models.UserTypeEmployee) {
		if wl.EmployeeID != userCtx.UserID {
			respondWithError(w, http.StatusForbidden, "Access denied")
			return
		}
	} else {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	respondWithJSON(w, http.StatusOK, wl)
}

func GetWeeklySummary(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can view summaries")
		return
	}

	db := database.GetDB()

	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, weekStart.Location())

	var totalHours float64
	err := db.QueryRow(`
		SELECT COALESCE(SUM(wl.hours_worked), 0)
		FROM work_logs wl
		JOIN employees e ON wl.employee_id = e.user_id
		WHERE e.contractor_id = $1 AND wl.check_in_time >= $2
	`, userCtx.UserID, weekStart).Scan(&totalHours)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch weekly summary")
		return
	}

	summary := map[string]interface{}{
		"total_hours": totalHours,
		"week_start":  weekStart,
	}

	respondWithJSON(w, http.StatusOK, summary)
}

func GetSummaryByEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can view summaries")
		return
	}

	db := database.GetDB()

	query := `
		SELECT e.user_id as employee_id, u.name as employee_name, 
		       COALESCE(SUM(wl.hours_worked), 0) as total_hours
		FROM employees e
		JOIN users u ON e.user_id = u.id
		LEFT JOIN work_logs wl ON wl.employee_id = e.user_id
		WHERE e.contractor_id = $1 AND e.is_active = true
		GROUP BY e.user_id, u.name
		ORDER BY total_hours DESC
	`

	rows, err := db.Query(query, userCtx.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch employee summary")
		return
	}
	defer rows.Close()

	type EmployeeSummary struct {
		EmployeeID   string  `json:"employee_id"`
		EmployeeName string  `json:"employee_name"`
		TotalHours   float64 `json:"total_hours"`
	}

	var summaries []EmployeeSummary
	for rows.Next() {
		var summary EmployeeSummary
		err := rows.Scan(&summary.EmployeeID, &summary.EmployeeName, &summary.TotalHours)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan employee summary")
			return
		}
		summaries = append(summaries, summary)
	}

	if summaries == nil {
		summaries = []EmployeeSummary{}
	}

	respondWithJSON(w, http.StatusOK, summaries)
}

func GetSummaryByProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can view summaries")
		return
	}

	db := database.GetDB()

	query := `
		SELECT p.id as project_id, p.title as project_title, 
		       COALESCE(SUM(wl.hours_worked), 0) as total_hours
		FROM projects p
		LEFT JOIN work_logs wl ON wl.project_id = p.id
		WHERE p.contractor_id = $1
		GROUP BY p.id, p.title
		ORDER BY total_hours DESC
	`

	rows, err := db.Query(query, userCtx.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project summary")
		return
	}
	defer rows.Close()

	type ProjectSummary struct {
		ProjectID    string  `json:"project_id"`
		ProjectTitle string  `json:"project_title"`
		TotalHours   float64 `json:"total_hours"`
	}

	var summaries []ProjectSummary
	for rows.Next() {
		var summary ProjectSummary
		err := rows.Scan(&summary.ProjectID, &summary.ProjectTitle, &summary.TotalHours)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan project summary")
			return
		}
		summaries = append(summaries, summary)
	}

	if summaries == nil {
		summaries = []ProjectSummary{}
	}

	respondWithJSON(w, http.StatusOK, summaries)
}

// func GetProjectWorkLogs(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	vars := mux.Vars(r)
// 	projectID := vars["id"]

// 	db := database.GetDB()

// 	var hasAccess bool
// 	if userCtx.UserType == string(models.UserTypeHouseOwner) {
// 		err := db.QueryRow(`
// 			SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2)
// 		`, projectID, userCtx.UserID).Scan(&hasAccess)
// 		if err != nil || !hasAccess {
// 			respondWithError(w, http.StatusForbidden, "Access denied")
// 			return
// 		}
// 	} else if userCtx.UserType == string(models.UserTypeContractor) {
// 		err := db.QueryRow(`
// 			SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND contractor_id = $2)
// 		`, projectID, userCtx.UserID).Scan(&hasAccess)
// 		if err != nil || !hasAccess {
// 			respondWithError(w, http.StatusForbidden, "Access denied")
// 			return
// 		}
// 	} else if userCtx.UserType == string(models.UserTypeEmployee) {
// 		err := db.QueryRow(`
// 			SELECT EXISTS(SELECT 1 FROM employee_projects WHERE project_id = $1 AND employee_id = $2)
// 		`, projectID, userCtx.UserID).Scan(&hasAccess)
// 		if err != nil || !hasAccess {
// 			respondWithError(w, http.StatusForbidden, "Access denied")
// 			return
// 		}
// 	} else {
// 		respondWithError(w, http.StatusForbidden, "Access denied")
// 		return
// 	}

// 	query := `
// 		SELECT wl.id, wl.employee_id, wl.project_id, wl.check_in_time, wl.check_out_time,
// 		       wl.check_in_photo_url, wl.check_out_photo_url,
// 		       wl.check_in_latitude, wl.check_in_longitude,
// 		       wl.check_out_latitude, wl.check_out_longitude,
// 		       wl.hours_worked, wl.created_at,
// 		       u.name as employee_name, p.title as project_name
// 		FROM work_logs wl
// 		JOIN users u ON wl.employee_id = u.id
// 		JOIN projects p ON wl.project_id = p.id
// 		WHERE wl.project_id = $1
// 		ORDER BY wl.check_in_time DESC
// 	`

// 	rows, err := db.Query(query, projectID)
// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch work logs")
// 		return
// 	}
// 	defer rows.Close()

// 	type WorkLogResponse struct {
// 		models.WorkLog
// 		EmployeeName string `json:"employee_name"`
// 		ProjectName  string `json:"project_name"`
// 	}

// 	var workLogs []WorkLogResponse
// 	for rows.Next() {
// 		var wl WorkLogResponse
// 		err := rows.Scan(
// 			&wl.ID,
// 			&wl.EmployeeID,
// 			&wl.ProjectID,
// 			&wl.CheckInTime,
// 			&wl.CheckOutTime,
// 			&wl.CheckInPhotoURL,
// 			&wl.CheckOutPhotoURL,
// 			&wl.CheckInLatitude,
// 			&wl.CheckInLongitude,
// 			&wl.CheckOutLatitude,
// 			&wl.CheckOutLongitude,
// 			&wl.HoursWorked,
// 			&wl.CreatedAt,
// 			&wl.EmployeeName,
// 			&wl.ProjectName,
// 		)
// 		if err != nil {
// 			respondWithError(w, http.StatusInternalServerError, "Failed to scan work log")
// 			return
// 		}
// 		workLogs = append(workLogs, wl)
// 	}

// 	if workLogs == nil {
// 		workLogs = []WorkLogResponse{}
// 	}

// 	respondWithJSON(w, http.StatusOK, workLogs)
// }
