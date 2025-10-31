package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
)

func CreateEstimate(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	var req models.CreateEstimateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	db := database.GetDB()

	var contractorID string
	err := db.QueryRow("SELECT contractor_id FROM contracts WHERE id = $1", req.ContractID).
		Scan(&contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Contract not found")
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve contract")
		return
	}

	if contractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the contractor can submit estimates")
		return
	}

	estimateID := uuid.New().String()
	query := `
		INSERT INTO estimates (id, contract_id, amount, description, submitted_by, submitted_at, status, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, contract_id, amount, description, submitted_by, submitted_at, status,
		          approved_by, approved_at, rejected_at, rejection_reason, is_active, created_at, updated_at
	`

	var estimate models.Estimate
	err = db.QueryRow(
		query, estimateID, req.ContractID, req.Amount, req.Description,
		userCtx.UserID, time.Now(), models.EstimateStatusPending, false,
	).Scan(
		&estimate.ID, &estimate.ContractID, &estimate.Amount, &estimate.Description,
		&estimate.SubmittedBy, &estimate.SubmittedAt, &estimate.Status,
		&estimate.ApprovedBy, &estimate.ApprovedAt, &estimate.RejectedAt,
		&estimate.RejectionReason, &estimate.IsActive, &estimate.CreatedAt, &estimate.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error creating estimate: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create estimate")
		return
	}

	respondWithJSON(w, http.StatusCreated, estimate)
}

func GetEstimatesByContract(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	contractID := vars["contractId"]

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
		SELECT id, contract_id, amount, description, submitted_by, submitted_at, status,
		       approved_by, approved_at, rejected_at, rejection_reason, is_active, created_at, updated_at
		FROM estimates
		WHERE contract_id = $1
		ORDER BY submitted_at DESC
	`

	rows, err := db.Query(query, contractID)
	if err != nil {
		log.Printf("Error querying estimates: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve estimates")
		return
	}
	defer rows.Close()

	estimates := []models.Estimate{}
	for rows.Next() {
		var e models.Estimate
		err := rows.Scan(
			&e.ID, &e.ContractID, &e.Amount, &e.Description, &e.SubmittedBy, &e.SubmittedAt,
			&e.Status, &e.ApprovedBy, &e.ApprovedAt, &e.RejectedAt, &e.RejectionReason,
			&e.IsActive, &e.CreatedAt, &e.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning estimate: %v", err)
			continue
		}
		estimates = append(estimates, e)
	}

	respondWithJSON(w, http.StatusOK, estimates)
}

func ApproveEstimate(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	estimateID := vars["id"]

	var req models.ApproveEstimateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	db := database.GetDB()

	var ownerID, contractID string
	err := db.QueryRow(`
		SELECT c.owner_id, e.contract_id
		FROM estimates e
		JOIN contracts c ON e.contract_id = c.id
		WHERE e.id = $1
	`, estimateID).Scan(&ownerID, &contractID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Estimate not found")
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve estimate")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can approve estimates")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	if req.SetAsActive {
		_, err = tx.Exec("UPDATE estimates SET is_active = false WHERE contract_id = $1", contractID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to deactivate other estimates")
			return
		}
	}

	query := `
		UPDATE estimates
		SET status = $1, approved_by = $2, approved_at = $3, is_active = $4, updated_at = $5
		WHERE id = $6
		RETURNING id, contract_id, amount, description, submitted_by, submitted_at, status,
		          approved_by, approved_at, rejected_at, rejection_reason, is_active, created_at, updated_at
	`

	var estimate models.Estimate
	err = tx.QueryRow(
		query, models.EstimateStatusApproved, userCtx.UserID, time.Now(),
		req.SetAsActive, time.Now(), estimateID,
	).Scan(
		&estimate.ID, &estimate.ContractID, &estimate.Amount, &estimate.Description,
		&estimate.SubmittedBy, &estimate.SubmittedAt, &estimate.Status,
		&estimate.ApprovedBy, &estimate.ApprovedAt, &estimate.RejectedAt,
		&estimate.RejectionReason, &estimate.IsActive, &estimate.CreatedAt, &estimate.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error approving estimate: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to approve estimate")
		return
	}

	if err = tx.Commit(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	respondWithJSON(w, http.StatusOK, estimate)
}

func RejectEstimate(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	estimateID := vars["id"]

	var req models.RejectEstimateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow(`
		SELECT c.owner_id
		FROM estimates e
		JOIN contracts c ON e.contract_id = c.id
		WHERE e.id = $1
	`, estimateID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Estimate not found")
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve estimate")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can reject estimates")
		return
	}

	query := `
		UPDATE estimates
		SET status = $1, rejected_at = $2, rejection_reason = $3, is_active = false, updated_at = $4
		WHERE id = $5
		RETURNING id, contract_id, amount, description, submitted_by, submitted_at, status,
		          approved_by, approved_at, rejected_at, rejection_reason, is_active, created_at, updated_at
	`

	var estimate models.Estimate
	err = db.QueryRow(
		query, models.EstimateStatusRejected, time.Now(), req.Reason, time.Now(), estimateID,
	).Scan(
		&estimate.ID, &estimate.ContractID, &estimate.Amount, &estimate.Description,
		&estimate.SubmittedBy, &estimate.SubmittedAt, &estimate.Status,
		&estimate.ApprovedBy, &estimate.ApprovedAt, &estimate.RejectedAt,
		&estimate.RejectionReason, &estimate.IsActive, &estimate.CreatedAt, &estimate.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error rejecting estimate: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to reject estimate")
		return
	}

	respondWithJSON(w, http.StatusOK, estimate)
}
