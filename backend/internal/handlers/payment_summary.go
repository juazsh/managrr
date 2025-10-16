package handlers

import (
	"database/sql"
	"encoding/json"
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

func AddPaymentSummary(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeHouseOwner) {
		respondWithError(w, http.StatusForbidden, "Only house owners can add payment summaries")
		return
	}

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	projectID := r.FormValue("project_id")
	if projectID == "" {
		respondWithError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	amount := r.FormValue("amount")
	if amount == "" {
		respondWithError(w, http.StatusBadRequest, "amount is required")
		return
	}

	paymentMethod := r.FormValue("payment_method")
	if paymentMethod == "" {
		respondWithError(w, http.StatusBadRequest, "payment_method is required")
		return
	}

	if paymentMethod != string(models.PaymentMethodCash) &&
		paymentMethod != string(models.PaymentMethodBankTransfer) &&
		paymentMethod != string(models.PaymentMethodZelle) &&
		paymentMethod != string(models.PaymentMethodPaypal) &&
		paymentMethod != string(models.PaymentMethodCashApp) &&
		paymentMethod != string(models.PaymentMethodVenmo) &&
		paymentMethod != string(models.PaymentMethodOther) {
		respondWithError(w, http.StatusBadRequest, "Invalid payment_method")
		return
	}

	paymentDate := r.FormValue("payment_date")
	if paymentDate == "" {
		respondWithError(w, http.StatusBadRequest, "payment_date is required")
		return
	}

	var amountFloat float64
	if _, err := strconv.ParseFloat(amount, 64); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid amount format")
		return
	}
	amountFloat, _ = strconv.ParseFloat(amount, 64)

	if amountFloat <= 0 {
		respondWithError(w, http.StatusBadRequest, "Amount must be positive")
		return
	}

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project ownership")
		return
	}

	if ownerID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the project owner can add payment summaries")
		return
	}

	var screenshotURL *string
	file, header, err := r.FormFile("screenshot")
	if err == nil {
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png")
			return
		}

		supabaseStorage := storage.NewSupabaseStorage()
		uploadedURL, err := supabaseStorage.UploadFile(file, header, projectID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload screenshot")
			return
		}
		screenshotURL = &uploadedURL
	}

	notes := r.FormValue("notes")

	query := `
		INSERT INTO payment_summaries (project_id, amount, payment_method, payment_date, screenshot_url, notes, added_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, project_id, amount, payment_method, payment_date, screenshot_url, notes, added_by, status, created_at, updated_at
	`

	var payment models.PaymentSummary
	err = db.QueryRow(
		query,
		projectID,
		amountFloat,
		paymentMethod,
		paymentDate,
		screenshotURL,
		nilIfEmpty(notes),
		userCtx.UserID,
	).Scan(
		&payment.ID,
		&payment.ProjectID,
		&payment.Amount,
		&payment.PaymentMethod,
		&payment.PaymentDate,
		&payment.ScreenshotURL,
		&payment.Notes,
		&payment.AddedBy,
		&payment.Status,
		&payment.CreatedAt,
		&payment.UpdatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create payment summary")
		return
	}

	respondWithJSON(w, http.StatusCreated, payment)
}

func ListPaymentSummaries(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["project_id"]

	db := database.GetDB()

	var ownerID, contractorID sql.NullString
	err := db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", projectID).Scan(&ownerID, &contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project access")
		return
	}

	isOwner := ownerID.Valid && ownerID.String == userCtx.UserID
	isContractor := contractorID.Valid && contractorID.String == userCtx.UserID

	if !isOwner && !isContractor {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT ps.id, ps.project_id, ps.amount, ps.payment_method, ps.payment_date, 
		       ps.screenshot_url, ps.notes, ps.added_by, ps.status, 
		       ps.confirmed_by, ps.confirmed_at, ps.disputed_at, ps.dispute_reason,
		       ps.created_at, ps.updated_at, u.name as added_by_name
		FROM payment_summaries ps
		JOIN users u ON ps.added_by = u.id
		WHERE ps.project_id = $1
		ORDER BY ps.payment_date DESC, ps.created_at DESC
	`

	rows, err := db.Query(query, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch payment summaries")
		return
	}
	defer rows.Close()

	var payments []map[string]interface{}
	for rows.Next() {
		var payment models.PaymentSummary
		var addedByName string

		err := rows.Scan(
			&payment.ID,
			&payment.ProjectID,
			&payment.Amount,
			&payment.PaymentMethod,
			&payment.PaymentDate,
			&payment.ScreenshotURL,
			&payment.Notes,
			&payment.AddedBy,
			&payment.Status,
			&payment.ConfirmedBy,
			&payment.ConfirmedAt,
			&payment.DisputedAt,
			&payment.DisputeReason,
			&payment.CreatedAt,
			&payment.UpdatedAt,
			&addedByName,
		)

		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan payment summary")
			return
		}

		paymentData := map[string]interface{}{
			"id":             payment.ID,
			"project_id":     payment.ProjectID,
			"amount":         payment.Amount,
			"payment_method": payment.PaymentMethod,
			"payment_date":   payment.PaymentDate,
			"screenshot_url": payment.ScreenshotURL,
			"notes":          payment.Notes,
			"added_by":       payment.AddedBy,
			"added_by_name":  addedByName,
			"status":         payment.Status,
			"confirmed_by":   payment.ConfirmedBy,
			"confirmed_at":   payment.ConfirmedAt,
			"disputed_at":    payment.DisputedAt,
			"dispute_reason": payment.DisputeReason,
			"created_at":     payment.CreatedAt,
			"updated_at":     payment.UpdatedAt,
		}

		payments = append(payments, paymentData)
	}

	if payments == nil {
		payments = []map[string]interface{}{}
	}

	respondWithJSON(w, http.StatusOK, payments)
}

func ConfirmPayment(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can confirm payments")
		return
	}

	vars := mux.Vars(r)
	paymentID := vars["id"]

	db := database.GetDB()

	var payment models.PaymentSummary
	err := db.QueryRow(`
		SELECT ps.id, ps.project_id, ps.status
		FROM payment_summaries ps
		WHERE ps.id = $1
	`, paymentID).Scan(&payment.ID, &payment.ProjectID, &payment.Status)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Payment summary not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch payment summary")
		return
	}

	var contractorID sql.NullString
	err = db.QueryRow("SELECT contractor_id FROM projects WHERE id = $1", payment.ProjectID).Scan(&contractorID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project contractor")
		return
	}

	if !contractorID.Valid || contractorID.String != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the assigned contractor can confirm payments")
		return
	}

	if payment.Status != models.PaymentStatusPending {
		respondWithError(w, http.StatusBadRequest, "Payment is not in pending status")
		return
	}

	_, err = db.Exec(`
		UPDATE payment_summaries 
		SET status = $1, confirmed_by = $2, confirmed_at = $3, updated_at = $3
		WHERE id = $4
	`, models.PaymentStatusConfirmed, userCtx.UserID, time.Now(), paymentID)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to confirm payment")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Payment confirmed successfully"})
}

func DisputePayment(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can dispute payments")
		return
	}

	vars := mux.Vars(r)
	paymentID := vars["id"]

	var req struct {
		Reason string `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Reason == "" {
		respondWithError(w, http.StatusBadRequest, "reason is required")
		return
	}

	db := database.GetDB()

	var payment models.PaymentSummary
	err := db.QueryRow(`
		SELECT ps.id, ps.project_id, ps.status
		FROM payment_summaries ps
		WHERE ps.id = $1
	`, paymentID).Scan(&payment.ID, &payment.ProjectID, &payment.Status)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Payment summary not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch payment summary")
		return
	}

	var contractorID sql.NullString
	err = db.QueryRow("SELECT contractor_id FROM projects WHERE id = $1", payment.ProjectID).Scan(&contractorID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project contractor")
		return
	}

	if !contractorID.Valid || contractorID.String != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the assigned contractor can dispute payments")
		return
	}

	if payment.Status != models.PaymentStatusPending {
		respondWithError(w, http.StatusBadRequest, "Payment is not in pending status")
		return
	}

	_, err = db.Exec(`
		UPDATE payment_summaries 
		SET status = $1, disputed_at = $2, dispute_reason = $3, updated_at = $2
		WHERE id = $4
	`, models.PaymentStatusDisputed, time.Now(), req.Reason, paymentID)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to dispute payment")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Payment disputed successfully"})
}

func UpdatePaymentSummary(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	paymentID := vars["id"]

	db := database.GetDB()

	var existing models.PaymentSummary
	err := db.QueryRow(`
		SELECT id, project_id, added_by, status, screenshot_url
		FROM payment_summaries WHERE id = $1
	`, paymentID).Scan(&existing.ID, &existing.ProjectID, &existing.AddedBy, &existing.Status, &existing.ScreenshotURL)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Payment summary not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch payment summary")
		return
	}

	if existing.AddedBy != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the creator can update this payment summary")
		return
	}

	if existing.Status != models.PaymentStatusPending {
		respondWithError(w, http.StatusBadRequest, "Cannot update payment that is not pending")
		return
	}

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	amount := r.FormValue("amount")
	if amount == "" {
		respondWithError(w, http.StatusBadRequest, "amount is required")
		return
	}

	paymentMethod := r.FormValue("payment_method")
	if paymentMethod == "" {
		respondWithError(w, http.StatusBadRequest, "payment_method is required")
		return
	}

	if paymentMethod != string(models.PaymentMethodCash) &&
		paymentMethod != string(models.PaymentMethodBankTransfer) &&
		paymentMethod != string(models.PaymentMethodZelle) &&
		paymentMethod != string(models.PaymentMethodPaypal) &&
		paymentMethod != string(models.PaymentMethodCashApp) &&
		paymentMethod != string(models.PaymentMethodVenmo) &&
		paymentMethod != string(models.PaymentMethodOther) {
		respondWithError(w, http.StatusBadRequest, "Invalid payment_method")
		return
	}

	paymentDate := r.FormValue("payment_date")
	if paymentDate == "" {
		respondWithError(w, http.StatusBadRequest, "payment_date is required")
		return
	}

	var amountFloat float64
	if _, err := strconv.ParseFloat(amount, 64); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid amount format")
		return
	}
	amountFloat, _ = strconv.ParseFloat(amount, 64)

	if amountFloat <= 0 {
		respondWithError(w, http.StatusBadRequest, "Amount must be positive")
		return
	}

	screenshotURL := existing.ScreenshotURL
	file, header, err := r.FormFile("screenshot")
	if err == nil {
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png")
			return
		}

		supabaseStorage := storage.NewSupabaseStorage()
		uploadedURL, err := supabaseStorage.UploadFile(file, header, existing.ProjectID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload screenshot")
			return
		}
		screenshotURL = &uploadedURL
	}

	notes := r.FormValue("notes")

	_, err = db.Exec(`
		UPDATE payment_summaries 
		SET amount = $1, payment_method = $2, payment_date = $3, 
		    screenshot_url = $4, notes = $5
		WHERE id = $6
	`, amountFloat, paymentMethod, paymentDate, screenshotURL, nilIfEmpty(notes), paymentID)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update payment summary")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Payment summary updated successfully"})
}

func DeletePaymentSummary(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	paymentID := vars["id"]

	db := database.GetDB()

	var payment models.PaymentSummary
	err := db.QueryRow(`
		SELECT id, project_id, added_by, status
		FROM payment_summaries WHERE id = $1
	`, paymentID).Scan(&payment.ID, &payment.ProjectID, &payment.AddedBy, &payment.Status)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Payment summary not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch payment summary")
		return
	}

	var ownerID sql.NullString
	err = db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", payment.ProjectID).Scan(&ownerID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project ownership")
		return
	}

	isCreator := payment.AddedBy == userCtx.UserID
	isProjectOwner := ownerID.Valid && ownerID.String == userCtx.UserID

	if !isCreator && !isProjectOwner {
		respondWithError(w, http.StatusForbidden, "Only the creator or project owner can delete this payment summary")
		return
	}

	if payment.Status == models.PaymentStatusConfirmed {
		respondWithError(w, http.StatusBadRequest, "Cannot delete confirmed payment")
		return
	}

	_, err = db.Exec("DELETE FROM payment_summaries WHERE id = $1", paymentID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete payment summary")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Payment summary deleted successfully"})
}
