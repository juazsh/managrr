package handlers

import (
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

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
