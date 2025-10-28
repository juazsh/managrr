package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
)

func CreateProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeHouseOwner) {
		respondWithError(w, http.StatusForbidden, "Only house owners can create projects")
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid multipart form data")
		return
	}

	title := r.FormValue("title")
	if title == "" {
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	description := r.FormValue("description")
	if description == "" {
		respondWithError(w, http.StatusBadRequest, "Description is required")
		return
	}

	estimatedCostStr := r.FormValue("estimated_cost")
	if estimatedCostStr == "" {
		respondWithError(w, http.StatusBadRequest, "Estimated cost is required")
		return
	}

	estimatedCost, err := strconv.ParseFloat(estimatedCostStr, 64)
	if err != nil || estimatedCost <= 0 {
		respondWithError(w, http.StatusBadRequest, "Estimated cost must be a positive number")
		return
	}

	address := r.FormValue("address")
	var addressPtr *string
	if address != "" {
		addressPtr = &address
	}

	db := database.GetDB()
	var project models.Project

	query := `
		INSERT INTO projects (owner_id, title, description, estimated_cost, address, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
	`

	err = db.QueryRow(
		query,
		userCtx.UserID,
		title,
		description,
		estimatedCost,
		addressPtr,
		models.ProjectStatusDraft,
	).Scan(
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

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	files := r.MultipartForm.File["photos"]
	if len(files) > 0 {
		supabaseStorage := storage.NewSupabaseStorage()

		for _, fileHeader := range files {
			file, err := fileHeader.Open()
			if err != nil {
				continue
			}
			defer file.Close()

			if fileHeader.Size > 5*1024*1024 {
				continue
			}

			ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
			allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
			if !allowedExts[ext] {
				continue
			}

			photoURL, err := supabaseStorage.UploadFile(file, fileHeader, project.ID)
			if err != nil {
				continue
			}

			_, err = db.Exec(`
				INSERT INTO project_photos (project_id, photo_url, uploaded_by)
				VALUES ($1, $2, $3)
			`, project.ID, photoURL, userCtx.UserID)

			if err != nil {
				continue
			}
		}
	}

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
			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description, 
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
			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description, 
			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
			       NULL as contractor_name,
			       0 as contractor_count
			FROM projects p
			JOIN project_contractors pc ON p.id = pc.project_id
			WHERE pc.contractor_id = $1
			ORDER BY p.created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	case string(models.UserTypeEmployee):
		query := `
			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description, 
			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
			       NULL as contractor_name,
			       0 as contractor_count
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
			&project.ContractorID,
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
		SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description, 
		       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
		       o.name as owner_name, o.email as owner_email,
		       c.name as contractor_name, c.email as contractor_email
		FROM projects p
		LEFT JOIN users o ON p.owner_id = o.id
		LEFT JOIN users c ON p.contractor_id = c.id
		WHERE p.id = $1
	`

	type ContractorInfo struct {
		ContractorID string `json:"contractor_id"`
		Name         string `json:"name"`
		Email        string `json:"email"`
	}

	var project struct {
		models.Project
		OwnerName       string           `json:"owner_name"`
		OwnerEmail      string           `json:"owner_email"`
		ContractorName  *string          `json:"contractor_name,omitempty"`
		ContractorEmail *string          `json:"contractor_email,omitempty"`
		Contractors     []ContractorInfo `json:"contractors"`
	}

	err := db.QueryRow(query, projectID).Scan(
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
		&project.OwnerName,
		&project.OwnerEmail,
		&project.ContractorName,
		&project.ContractorEmail,
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
		hasAccess = project.ContractorID != nil && *project.ContractorID == userCtx.UserID

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
		RETURNING id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
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
		&project.ContractorID,
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
		ContractorID string `json:"contractor_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.ContractorID == "" {
		respondWithError(w, http.StatusBadRequest, "contractor_id is required")
		return
	}

	var userType string
	err = db.QueryRow("SELECT user_type FROM users WHERE id = $1", req.ContractorID).Scan(&userType)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Contractor not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to lookup contractor")
		return
	}

	if userType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusBadRequest, "User is not a contractor")
		return
	}

	query := `
		INSERT INTO project_contractors (project_id, contractor_id)
		VALUES ($1, $2)
		RETURNING id
	`

	var id string
	err = db.QueryRow(query, projectID, req.ContractorID).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			respondWithError(w, http.StatusConflict, "Contractor already assigned to this project")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to assign contractor")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Contractor assigned successfully",
		"id":      id,
	})
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

	query := `DELETE FROM project_contractors WHERE project_id = $1 AND contractor_id = $2`
	result, err := db.Exec(query, projectID, contractorID)
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
	}

	if !hasAccess {
		var isContractor bool
		err = db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM project_contractors 
				WHERE project_id = $1 AND contractor_id = $2
			)
		`, projectID, userCtx.UserID).Scan(&isContractor)
		if err == nil && isContractor {
			hasAccess = true
		}
	}

	if !hasAccess && userCtx.UserType == string(models.UserTypeEmployee) {
		var isAssignedEmployee bool
		err = db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM employee_projects 
				WHERE project_id = $1 AND employee_id = $2
			)
		`, projectID, userCtx.UserID).Scan(&isAssignedEmployee)
		if err == nil && isAssignedEmployee {
			hasAccess = true
		}
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT pc.contractor_id, u.name, u.email, u.phone, pc.assigned_at
		FROM project_contractors pc
		JOIN users u ON pc.contractor_id = u.id
		WHERE pc.project_id = $1
		ORDER BY pc.assigned_at DESC
	`

	rows, err := db.Query(query, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch contractors")
		return
	}
	defer rows.Close()

	type ContractorInfo struct {
		ContractorID string  `json:"contractor_id"`
		Name         string  `json:"name"`
		Email        string  `json:"email"`
		Phone        *string `json:"phone,omitempty"`
		AssignedAt   string  `json:"assigned_at"`
	}

	var contractors []ContractorInfo
	for rows.Next() {
		var contractor ContractorInfo
		err := rows.Scan(
			&contractor.ContractorID,
			&contractor.Name,
			&contractor.Email,
			&contractor.Phone,
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

	if contractors == nil {
		contractors = []ContractorInfo{}
	}

	respondWithJSON(w, http.StatusOK, contractors)
}

// func AssignContractor(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	vars := mux.Vars(r)
// 	projectID := vars["id"]

// 	db := database.GetDB()

// 	var ownerID string
// 	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

// 	if err == sql.ErrNoRows {
// 		respondWithError(w, http.StatusNotFound, "Project not found")
// 		return
// 	}

// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
// 		return
// 	}

// 	if ownerID != userCtx.UserID {
// 		respondWithError(w, http.StatusForbidden, "Only the project owner can assign a contractor")
// 		return
// 	}

// 	var req models.AssignContractorRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid request body")
// 		return
// 	}

// 	if req.ContractorEmail == "" {
// 		respondWithError(w, http.StatusBadRequest, "Contractor email is required")
// 		return
// 	}

// 	var contractorID string
// 	var userType string
// 	err = db.QueryRow(
// 		"SELECT id, user_type FROM users WHERE email = $1",
// 		req.ContractorEmail,
// 	).Scan(&contractorID, &userType)

// 	if err == sql.ErrNoRows {
// 		respondWithError(w, http.StatusNotFound, "Contractor not found")
// 		return
// 	}

// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to lookup contractor")
// 		return
// 	}

// 	if userType != string(models.UserTypeContractor) {
// 		respondWithError(w, http.StatusBadRequest, "User is not a contractor")
// 		return
// 	}

// 	query := `
// 		UPDATE projects
// 		SET contractor_id = $1, updated_at = NOW()
// 		WHERE id = $2
// 		RETURNING id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
// 	`

// 	var project models.Project
// 	err = db.QueryRow(query, contractorID, projectID).Scan(
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

// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to assign contractor")
// 		return
// 	}

// 	respondWithJSON(w, http.StatusOK, project)
// }

// func GetProject(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	vars := mux.Vars(r)
// 	projectID := vars["id"]

// 	db := database.GetDB()

// 	query := `
// 		SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description,
// 		       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
// 		       o.name as owner_name, o.email as owner_email,
// 		       c.name as contractor_name, c.email as contractor_email
// 		FROM projects p
// 		LEFT JOIN users o ON p.owner_id = o.id
// 		LEFT JOIN users c ON p.contractor_id = c.id
// 		WHERE p.id = $1
// 	`

// 	var project struct {
// 		models.Project
// 		OwnerName       string  `json:"owner_name"`
// 		OwnerEmail      string  `json:"owner_email"`
// 		ContractorName  *string `json:"contractor_name,omitempty"`
// 		ContractorEmail *string `json:"contractor_email,omitempty"`
// 	}

// 	err := db.QueryRow(query, projectID).Scan(
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
// 		&project.OwnerName,
// 		&project.OwnerEmail,
// 		&project.ContractorName,
// 		&project.ContractorEmail,
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

// 	switch userCtx.UserType {
// 	case string(models.UserTypeHouseOwner):
// 		hasAccess = project.OwnerID == userCtx.UserID

// 	case string(models.UserTypeContractor):
// 		hasAccess = project.ContractorID != nil && *project.ContractorID == userCtx.UserID

// 	case string(models.UserTypeEmployee):
// 		var employeeAccess bool
// 		checkQuery := `
// 			SELECT EXISTS(
// 				SELECT 1 FROM employee_projects
// 				WHERE employee_id = $1 AND project_id = $2
// 			)
// 		`
// 		db.QueryRow(checkQuery, userCtx.UserID, projectID).Scan(&employeeAccess)
// 		hasAccess = employeeAccess
// 	}

// 	if !hasAccess {
// 		respondWithError(w, http.StatusForbidden, "You don't have access to this project")
// 		return
// 	}

// 	respondWithJSON(w, http.StatusOK, project)
// }

// func ListProjects(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	db := database.GetDB()

// 	var rows *sql.Rows
// 	var err error

// 	type ProjectWithContractor struct {
// 		models.Project
// 		ContractorName *string `json:"contractor_name,omitempty"`
// 	}

// 	var projects []ProjectWithContractor

// 	switch userCtx.UserType {
// 	case string(models.UserTypeHouseOwner):
// 		query := `
// 			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description,
// 			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
// 			       c.name as contractor_name
// 			FROM projects p
// 			LEFT JOIN users c ON p.contractor_id = c.id
// 			WHERE p.owner_id = $1
// 			ORDER BY p.created_at DESC
// 		`
// 		rows, err = db.Query(query, userCtx.UserID)

// 	case string(models.UserTypeContractor):
// 		query := `
// 			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description,
// 			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
// 			       NULL as contractor_name
// 			FROM projects p
// 			WHERE p.contractor_id = $1
// 			ORDER BY p.created_at DESC
// 		`
// 		rows, err = db.Query(query, userCtx.UserID)

// 	case string(models.UserTypeEmployee):
// 		query := `
// 			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description,
// 			       p.estimated_cost, p.address, p.status, p.created_at, p.updated_at,
// 			       NULL as contractor_name
// 			FROM projects p
// 			JOIN employee_projects ep ON p.id = ep.project_id
// 			WHERE ep.employee_id = $1
// 			ORDER BY p.created_at DESC
// 		`
// 		rows, err = db.Query(query, userCtx.UserID)

// 	default:
// 		respondWithError(w, http.StatusBadRequest, "Invalid user type")
// 		return
// 	}

// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch projects")
// 		return
// 	}
// 	defer rows.Close()

// 	for rows.Next() {
// 		var project ProjectWithContractor
// 		err := rows.Scan(
// 			&project.ID,
// 			&project.OwnerID,
// 			&project.ContractorID,
// 			&project.Title,
// 			&project.Description,
// 			&project.EstimatedCost,
// 			&project.Address,
// 			&project.Status,
// 			&project.CreatedAt,
// 			&project.UpdatedAt,
// 			&project.ContractorName,
// 		)
// 		if err != nil {
// 			respondWithError(w, http.StatusInternalServerError, "Failed to scan project")
// 			return
// 		}
// 		projects = append(projects, project)
// 	}

// 	if err = rows.Err(); err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Error iterating projects")
// 		return
// 	}

// 	if projects == nil {
// 		projects = []ProjectWithContractor{}
// 	}

// 	respondWithJSON(w, http.StatusOK, projects)
// }
