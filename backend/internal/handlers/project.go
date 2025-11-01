package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
)

func CreateProject(w http.ResponseWriter, r *http.Request) {
	log.Println("=== CreateProject Handler Started ===")

	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		log.Println("ERROR: User not found in context")
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}
	log.Printf("User authenticated: ID=%s, Type=%s", userCtx.UserID, userCtx.UserType)

	if userCtx.UserType != string(models.UserTypeHouseOwner) {
		log.Printf("ERROR: Invalid user type. Expected house_owner, got %s", userCtx.UserType)
		respondWithError(w, http.StatusForbidden, "Only house owners can create projects")
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Printf("ERROR: Failed to parse multipart form: %v", err)
		respondWithError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}
	log.Println("Multipart form parsed successfully")

	title := r.FormValue("title")
	description := r.FormValue("description")
	estimatedCostStr := r.FormValue("estimated_cost")
	address := r.FormValue("address")
	status := r.FormValue("status")

	log.Printf("Form values - Title: %s, Description: %s, EstimatedCost: %s, Address: %s, Status: %s",
		title, description, estimatedCostStr, address, status)

	if title == "" {
		log.Println("ERROR: Title is required but empty")
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	if status == "" {
		status = string(models.ProjectStatusDraft)
		log.Printf("Status not provided, defaulting to: %s", status)
	}

	var estimatedCost float64
	if estimatedCostStr != "" {
		estimatedCost, err = strconv.ParseFloat(estimatedCostStr, 64)
		if err != nil {
			log.Printf("ERROR: Invalid estimated_cost value: %s, error: %v", estimatedCostStr, err)
			respondWithError(w, http.StatusBadRequest, "Invalid estimated cost")
			return
		}
		log.Printf("Estimated cost parsed: %.2f", estimatedCost)
	}

	db := database.GetDB()
	projectID := uuid.New().String()
	log.Printf("Generated new project ID: %s", projectID)

	query := `
		INSERT INTO projects (id, owner_id, title, description, estimated_cost, address, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, owner_id, title, description, estimated_cost, address, status, created_at, updated_at
	`
	log.Println("Executing INSERT query...")

	var project models.Project
	err = db.QueryRow(
		query,
		projectID,
		userCtx.UserID,
		title,
		description,
		estimatedCost,
		address,
		status,
	).Scan(
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

	if err != nil {
		log.Printf("ERROR: Failed to insert project into database: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}
	log.Printf("Project created successfully in database with ID: %s", project.ID)

	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		files := r.MultipartForm.File["photos"]
		log.Printf("Found %d photo files to upload", len(files))

		supabaseStorage := storage.NewSupabaseStorage()

		for i, fileHeader := range files {
			log.Printf("Processing photo %d/%d: %s", i+1, len(files), fileHeader.Filename)

			file, err := fileHeader.Open()
			if err != nil {
				log.Printf("ERROR: Failed to open file %s: %v", fileHeader.Filename, err)
				continue
			}

			if fileHeader.Size > 5*1024*1024 {
				log.Printf("WARNING: File %s exceeds 5MB limit, skipping", fileHeader.Filename)
				file.Close()
				continue
			}

			ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
			allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
			if !allowedExts[ext] {
				log.Printf("WARNING: File %s has invalid extension %s, skipping", fileHeader.Filename, ext)
				file.Close()
				continue
			}

			photoURL, err := supabaseStorage.UploadFile(file, fileHeader, project.ID)
			file.Close()

			if err != nil {
				log.Printf("ERROR: Failed to upload photo to storage: %v", err)
				continue
			}
			log.Printf("Photo uploaded successfully: %s", photoURL)

			photoQuery := `
				INSERT INTO project_photos (project_id, photo_url, uploaded_by)
				VALUES ($1, $2, $3)
			`
			_, err = db.Exec(photoQuery, project.ID, photoURL, userCtx.UserID)
			if err != nil {
				log.Printf("ERROR: Failed to save photo record to database: %v", err)
				continue
			}
			log.Printf("Photo record saved to database")
		}
	}

	log.Printf("=== CreateProject Handler Completed Successfully ===")
	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"project": project,
	})
}

func ListProjects(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	db := database.GetDB()

	var rows *sql.Rows
	var err error

	type ProjectWithContractor struct {
		models.Project
		ContractorName  *string `json:"contractor_name,omitempty"`
		ContractorCount int     `json:"contractor_count"`
	}

	var projects []ProjectWithContractor

	switch userCtx.UserType {
	case string(models.UserTypeHouseOwner):
		query := `
			SELECT p.id, p.owner_id, p.title, p.description, 
			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
			       (SELECT u.name FROM project_contractors pc 
			        JOIN users u ON pc.contractor_id = u.id 
			        WHERE pc.project_id = p.id 
			        ORDER BY pc.assigned_at ASC LIMIT 1) as contractor_name,
			       (SELECT COUNT(*) FROM project_contractors pc 
			        WHERE pc.project_id = p.id) as contractor_count
			FROM projects p
			WHERE p.owner_id = $1
			ORDER BY p.created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	case string(models.UserTypeContractor):
		query := `
			SELECT p.id, p.owner_id, p.title, p.description, 
			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
			       NULL as contractor_name,
			       (SELECT COUNT(*) FROM project_contractors pc 
			        WHERE pc.project_id = p.id) as contractor_count
			FROM projects p
			JOIN project_contractors pc ON p.id = pc.project_id
			WHERE pc.contractor_id = $1
			ORDER BY p.created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	case string(models.UserTypeEmployee):
		query := `
			SELECT p.id, p.owner_id, p.title, p.description, 
			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
			       NULL as contractor_name,
			       (SELECT COUNT(*) FROM project_contractors pc 
			        WHERE pc.project_id = p.id) as contractor_count
			FROM projects p
			JOIN employee_projects ep ON p.id = ep.project_id
			WHERE ep.employee_id = $1
			ORDER BY p.created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	default:
		respondWithError(w, http.StatusBadRequest, "Invalid user type")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch projects")
		return
	}
	defer rows.Close()

	for rows.Next() {
		var project ProjectWithContractor
		err := rows.Scan(
			&project.ID,
			&project.OwnerID,
			&project.Title,
			&project.Description,
			&project.EstimatedCost,
			&project.Address,
			&project.Status,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.ContractorName,
			&project.ContractorCount,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan project")
			return
		}
		projects = append(projects, project)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating projects")
		return
	}

	if projects == nil {
		projects = []ProjectWithContractor{}
	}

	respondWithJSON(w, http.StatusOK, projects)
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	query := `
		SELECT p.id, p.owner_id, p.title, p.description, 
		       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
		       o.name as owner_name, o.email as owner_email
		FROM projects p
		LEFT JOIN users o ON p.owner_id = o.id
		WHERE p.id = $1
	`

	type ContractorInfo struct {
		ContractorID string `json:"contractor_id"`
		Name         string `json:"name"`
		Email        string `json:"email"`
	}

	var project struct {
		models.Project
		OwnerName   string           `json:"owner_name"`
		OwnerEmail  string           `json:"owner_email"`
		Contractors []ContractorInfo `json:"contractors"`
	}

	err := db.QueryRow(query, projectID).Scan(
		&project.ID,
		&project.OwnerID,
		&project.Title,
		&project.Description,
		&project.EstimatedCost,
		&project.Address,
		&project.Status,
		&project.CreatedAt,
		&project.UpdatedAt,
		&project.OwnerName,
		&project.OwnerEmail,
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

	switch userCtx.UserType {
	case string(models.UserTypeHouseOwner):
		hasAccess = project.OwnerID == userCtx.UserID

	case string(models.UserTypeContractor):
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

	case string(models.UserTypeEmployee):
		var employeeAccess bool
		checkQuery := `
			SELECT EXISTS(
				SELECT 1 FROM employee_projects 
				WHERE employee_id = $1 AND project_id = $2
			)
		`
		db.QueryRow(checkQuery, userCtx.UserID, projectID).Scan(&employeeAccess)
		hasAccess = employeeAccess
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "You don't have access to this project")
		return
	}

	contractorsQuery := `
		SELECT pc.contractor_id, u.name, u.email
		FROM project_contractors pc
		JOIN users u ON pc.contractor_id = u.id
		WHERE pc.project_id = $1
		ORDER BY pc.assigned_at DESC
	`

	rows, err := db.Query(contractorsQuery, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch contractors")
		return
	}
	defer rows.Close()

	var contractors []ContractorInfo
	for rows.Next() {
		var contractor ContractorInfo
		err := rows.Scan(
			&contractor.ContractorID,
			&contractor.Name,
			&contractor.Email,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan contractor")
			return
		}
		contractors = append(contractors, contractor)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating contractors")
		return
	}

	if contractors == nil {
		contractors = []ContractorInfo{}
	}

	project.Contractors = contractors

	respondWithJSON(w, http.StatusOK, project)
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can update this project")
		return
	}

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Title != nil && *req.Title == "" {
		respondWithError(w, http.StatusBadRequest, "Title cannot be empty")
		return
	}

	if req.Description != nil && *req.Description == "" {
		respondWithError(w, http.StatusBadRequest, "Description cannot be empty")
		return
	}

	if req.EstimatedCost != nil && *req.EstimatedCost <= 0 {
		respondWithError(w, http.StatusBadRequest, "Estimated cost must be a positive number")
		return
	}

	query := `
		UPDATE projects 
		SET title = COALESCE($1, title),
		    description = COALESCE($2, description),
		    estimated_cost = COALESCE($3, estimated_cost),
		    address = COALESCE($4, address),
		    status = COALESCE($5, status),
		    updated_at = NOW()
		WHERE id = $6
		RETURNING id, owner_id, title, description, estimated_cost, address, status, created_at, updated_at
	`

	var project models.Project
	err = db.QueryRow(
		query,
		req.Title,
		req.Description,
		req.EstimatedCost,
		req.Address,
		req.Status,
		projectID,
	).Scan(
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

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update project")
		return
	}

	respondWithJSON(w, http.StatusOK, project)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can delete this project")
		return
	}

	_, err = db.Exec("DELETE FROM projects WHERE id = $1", projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete project")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func AssignContractor(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can assign contractors")
		return
	}

	var req struct {
		ContractorIDs []string `json:"contractor_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if len(req.ContractorIDs) == 0 {
		respondWithError(w, http.StatusBadRequest, "contractor_ids is required and cannot be empty")
		return
	}

	successCount := 0
	duplicateCount := 0
	var failedContractors []string

	for _, contractorID := range req.ContractorIDs {
		if contractorID == "" {
			continue
		}

		var userType string
		err = db.QueryRow("SELECT user_type FROM users WHERE id = $1", contractorID).Scan(&userType)
		if err == sql.ErrNoRows {
			failedContractors = append(failedContractors, contractorID)
			continue
		}
		if err != nil {
			failedContractors = append(failedContractors, contractorID)
			continue
		}

		if userType != string(models.UserTypeContractor) {
			failedContractors = append(failedContractors, contractorID)
			continue
		}

		tx, err := db.Begin()
		if err != nil {
			failedContractors = append(failedContractors, contractorID)
			continue
		}

		pcQuery := `
			INSERT INTO project_contractors (project_id, contractor_id)
			VALUES ($1, $2)
			ON CONFLICT (project_id, contractor_id) DO NOTHING
		`
		result, err := tx.Exec(pcQuery, projectID, contractorID)
		if err != nil {
			tx.Rollback()
			failedContractors = append(failedContractors, contractorID)
			continue
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected > 0 {
			contractID := uuid.New().String()
			contractQuery := `
				INSERT INTO contracts (id, project_id, contractor_id, owner_id, status, start_date)
				VALUES ($1, $2, $3, $4, $5, $6)
				ON CONFLICT (project_id, contractor_id) DO NOTHING
			`
			_, err = tx.Exec(contractQuery, contractID, projectID, contractorID, ownerID, "active", time.Now())
			if err != nil {
				tx.Rollback()
				failedContractors = append(failedContractors, contractorID)
				continue
			}

			if err = tx.Commit(); err != nil {
				failedContractors = append(failedContractors, contractorID)
				continue
			}
			successCount++
		} else {
			tx.Rollback()
			duplicateCount++
		}
	}

	response := map[string]interface{}{
		"assigned_count":  successCount,
		"duplicate_count": duplicateCount,
	}

	if len(failedContractors) > 0 {
		response["failed_contractors"] = failedContractors
		response["message"] = "Some contractors could not be assigned"
	} else if successCount > 0 {
		response["message"] = "Contractors assigned successfully"
	} else {
		response["message"] = "All contractors were already assigned to this project"
	}

	respondWithJSON(w, http.StatusOK, response)
}

func RemoveContractor(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]
	contractorID := vars["contractorId"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can remove contractors")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	query := `DELETE FROM project_contractors WHERE project_id = $1 AND contractor_id = $2`
	result, err := tx.Exec(query, projectID, contractorID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to remove contractor")
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify deletion")
		return
	}

	if rowsAffected == 0 {
		respondWithError(w, http.StatusNotFound, "Contractor assignment not found")
		return
	}

	contractQuery := `
		UPDATE contracts
		SET status = $1, end_date = $2, updated_at = $3
		WHERE project_id = $4 AND contractor_id = $5
	`
	_, err = tx.Exec(contractQuery, "terminated", time.Now(), time.Now(), projectID, contractorID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to terminate contract")
		return
	}

	if err = tx.Commit(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func ListProjectContractors(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	hasAccess := false
	if ownerID == userCtx.UserID {
		hasAccess = true
	} else if userCtx.UserType == string(models.UserTypeContractor) {
		var isContractor bool
		db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM contracts
				WHERE project_id = $1 AND contractor_id = $2
			)
		`, projectID, userCtx.UserID).Scan(&isContractor)
		hasAccess = isContractor
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT c.id, c.contractor_id, u.name, u.email, c.created_at
		FROM contracts c
		JOIN users u ON c.contractor_id = u.id
		WHERE c.project_id = $1
		ORDER BY c.created_at DESC
	`

	rows, err := db.Query(query, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch contractors")
		return
	}
	defer rows.Close()

	type ContractorResponse struct {
		ContractID   string    `json:"contract_id"`
		ContractorID string    `json:"contractor_id"`
		Name         string    `json:"name"`
		Email        string    `json:"email"`
		AssignedAt   time.Time `json:"assigned_at"`
	}

	contractors := []ContractorResponse{}

	for rows.Next() {
		var contractor ContractorResponse
		err := rows.Scan(
			&contractor.ContractID,
			&contractor.ContractorID,
			&contractor.Name,
			&contractor.Email,
			&contractor.AssignedAt,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan contractor")
			return
		}
		contractors = append(contractors, contractor)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating contractors")
		return
	}

	respondWithJSON(w, http.StatusOK, contractors)
}
