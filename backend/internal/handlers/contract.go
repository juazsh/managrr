package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
)

func GetContractsByProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}
	log.Printf("Error scanning contract: %v", userCtx)

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()
	query := `
		SELECT c.id, c.project_id, c.contractor_id, c.owner_id, c.status,
		       c.start_date, c.end_date, c.terms, c.created_at, c.updated_at,
		       u.name as contractor_name, u.email as contractor_email
		FROM contracts c
		JOIN users u ON c.contractor_id = u.id
		WHERE c.project_id = $1
		ORDER BY c.created_at DESC
	`

	rows, err := db.Query(query, projectID)
	if err != nil {
		log.Printf("Error querying contracts: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve contracts")
		return
	}
	defer rows.Close()

	type ContractWithContractor struct {
		models.Contract
		ContractorName  string `json:"contractor_name"`
		ContractorEmail string `json:"contractor_email"`
	}

	contracts := []ContractWithContractor{}
	for rows.Next() {
		var c ContractWithContractor
		err := rows.Scan(
			&c.ID, &c.ProjectID, &c.ContractorID, &c.OwnerID, &c.Status,
			&c.StartDate, &c.EndDate, &c.Terms, &c.CreatedAt, &c.UpdatedAt,
			&c.ContractorName, &c.ContractorEmail,
		)
		if err != nil {
			log.Printf("Error scanning contract: %v", err)
			continue
		}
		contracts = append(contracts, c)
	}

	respondWithJSON(w, http.StatusOK, contracts)
}

func GetContract(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	contractID := vars["id"]

	db := database.GetDB()
	query := `
		SELECT id, project_id, contractor_id, owner_id, status,
		       start_date, end_date, terms, created_at, updated_at
		FROM contracts
		WHERE id = $1
	`

	var contract models.Contract
	err := db.QueryRow(query, contractID).Scan(
		&contract.ID, &contract.ProjectID, &contract.ContractorID, &contract.OwnerID,
		&contract.Status, &contract.StartDate, &contract.EndDate, &contract.Terms,
		&contract.CreatedAt, &contract.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Contract not found")
		return
	} else if err != nil {
		log.Printf("Error querying contract: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve contract")
		return
	}

	if contract.ContractorID != userCtx.UserID && contract.OwnerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	respondWithJSON(w, http.StatusOK, contract)
}

func UpdateContractStatus(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	contractID := vars["id"]

	var req models.UpdateContractStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	db := database.GetDB()

	var ownerID, contractorID string
	err := db.QueryRow("SELECT owner_id, contractor_id FROM contracts WHERE id = $1", contractID).
		Scan(&ownerID, &contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Contract not found")
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve contract")
		return
	}

	if ownerID != userCtx.UserID && contractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		UPDATE contracts
		SET status = $1, end_date = $2, updated_at = $3
		WHERE id = $4
		RETURNING id, project_id, contractor_id, owner_id, status,
		          start_date, end_date, terms, created_at, updated_at
	`

	var contract models.Contract
	err = db.QueryRow(query, req.Status, req.EndDate, time.Now(), contractID).Scan(
		&contract.ID, &contract.ProjectID, &contract.ContractorID, &contract.OwnerID,
		&contract.Status, &contract.StartDate, &contract.EndDate, &contract.Terms,
		&contract.CreatedAt, &contract.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error updating contract status: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to update contract")
		return
	}

	respondWithJSON(w, http.StatusOK, contract)
}
