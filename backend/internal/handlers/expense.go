package handlers

import (
	"database/sql"
	"net/http"
	"path/filepath"
	"strings"

	"strconv"

	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
)

func AddExpense(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
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

	date := r.FormValue("date")
	if date == "" {
		respondWithError(w, http.StatusBadRequest, "date is required")
		return
	}

	category := r.FormValue("category")
	if category == "" {
		respondWithError(w, http.StatusBadRequest, "category is required")
		return
	}

	if category != string(models.ExpenseCategoryMaterials) &&
		category != string(models.ExpenseCategoryLabor) &&
		category != string(models.ExpenseCategoryEquipment) &&
		category != string(models.ExpenseCategoryOther) {
		respondWithError(w, http.StatusBadRequest, "Invalid category. Must be one of: materials, labor, equipment, other")
		return
	}

	paidBy := r.FormValue("paid_by")
	if paidBy == "" {
		respondWithError(w, http.StatusBadRequest, "paid_by is required")
		return
	}

	if paidBy != string(models.ExpensePaidByContractor) &&
		paidBy != string(models.ExpensePaidByOwner) {
		respondWithError(w, http.StatusBadRequest, "Invalid paid_by. Must be either: contractor or owner")
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

	var ownerID, contractorID sql.NullString
	err := db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", projectID).Scan(&ownerID, &contractorID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	isOwner := ownerID.Valid && ownerID.String == userCtx.UserID
	isContractor := contractorID.Valid && contractorID.String == userCtx.UserID

	if !isOwner && !isContractor {
		respondWithError(w, http.StatusForbidden, "Only project owner or assigned contractor can add expenses")
		return
	}

	var receiptPhotoURL *string
	file, header, err := r.FormFile("receipt_photo")
	if err == nil {
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
			return
		}

		supabaseStorage := storage.NewSupabaseStorage()
		uploadedURL, err := supabaseStorage.UploadFile(file, header, projectID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload receipt photo")
			return
		}
		receiptPhotoURL = &uploadedURL
	}

	vendor := r.FormValue("vendor")
	description := r.FormValue("description")

	query := `
		INSERT INTO expenses (project_id, amount, vendor, date, category, description, paid_by, receipt_photo_url, added_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, project_id, amount, vendor, date, category, description, paid_by, receipt_photo_url, added_by, created_at
	`

	var expense models.Expense
	err = db.QueryRow(
		query,
		projectID,
		amountFloat,
		nilIfEmpty(vendor),
		date,
		category,
		nilIfEmpty(description),
		paidBy,
		receiptPhotoURL,
		userCtx.UserID,
	).Scan(
		&expense.ID,
		&expense.ProjectID,
		&expense.Amount,
		&expense.Vendor,
		&expense.Date,
		&expense.Category,
		&expense.Description,
		&expense.PaidBy,
		&expense.ReceiptPhotoURL,
		&expense.AddedBy,
		&expense.CreatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create expense")
		return
	}

	respondWithJSON(w, http.StatusCreated, expense)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
