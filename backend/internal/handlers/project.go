package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
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

	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Title == "" {
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	if req.Description == "" {
		respondWithError(w, http.StatusBadRequest, "Description is required")
		return
	}

	if req.EstimatedCost <= 0 {
		respondWithError(w, http.StatusBadRequest, "Estimated cost must be a positive number")
		return
	}

	db := database.GetDB()
	var project models.Project

	query := `
		INSERT INTO projects (owner_id, title, description, estimated_cost, address, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		userCtx.UserID,
		req.Title,
		req.Description,
		req.EstimatedCost,
		req.Address,
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

	respondWithJSON(w, http.StatusCreated, project)
}

func ListProjects(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	db := database.GetDB()
	var projects []models.Project
	var rows *sql.Rows
	var err error

	switch userCtx.UserType {
	case string(models.UserTypeHouseOwner):
		query := `
			SELECT id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
			FROM projects
			WHERE owner_id = $1
			ORDER BY created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	case string(models.UserTypeContractor):
		query := `
			SELECT id, owner_id, contractor_id, title, description, estimated_cost, address, status, created_at, updated_at
			FROM projects
			WHERE contractor_id = $1
			ORDER BY created_at DESC
		`
		rows, err = db.Query(query, userCtx.UserID)

	case string(models.UserTypeEmployee):
		query := `
			SELECT p.id, p.owner_id, p.contractor_id, p.title, p.description, p.estimated_cost, p.address, p.status, p.created_at, p.updated_at
			FROM projects p
			INNER JOIN employee_projects ep ON p.id = ep.project_id
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
		var project models.Project
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
		projects = []models.Project{}
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

	var project struct {
		models.Project
		OwnerName       string  `json:"owner_name"`
		OwnerEmail      string  `json:"owner_email"`
		ContractorName  *string `json:"contractor_name,omitempty"`
		ContractorEmail *string `json:"contractor_email,omitempty"`
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
