package handlers

import (
	"database/sql"
	"net/http"
	"path/filepath"
	"strings"

	"strconv"

	"github.com/gorilla/mux"
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

func GetProjectExpenses(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	projectID := mux.Vars(r)["id"]
	if projectID == "" {
		respondWithError(w, http.StatusBadRequest, "Project ID is required")
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
		respondWithError(w, http.StatusForbidden, "Only project owner or assigned contractor can view expenses")
		return
	}

	paidBy := r.URL.Query().Get("paid_by")
	category := r.URL.Query().Get("category")
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	if paidBy == "" {
		paidBy = "all"
	}

	if paidBy != "all" && paidBy != string(models.ExpensePaidByOwner) && paidBy != string(models.ExpensePaidByContractor) {
		respondWithError(w, http.StatusBadRequest, "Invalid paid_by filter")
		return
	}

	query := `
		SELECT e.id, e.project_id, e.amount, e.vendor, e.date, e.category, e.description, 
		       e.paid_by, e.receipt_photo_url, e.added_by, e.created_at, u.name
		FROM expenses e
		JOIN users u ON e.added_by = u.id
		WHERE e.project_id = $1
	`
	args := []interface{}{projectID}
	argIndex := 2

	if paidBy != "all" {
		query += " AND e.paid_by = $" + strconv.Itoa(argIndex)
		args = append(args, paidBy)
		argIndex++
	}

	if category != "" {
		query += " AND e.category = $" + strconv.Itoa(argIndex)
		args = append(args, category)
		argIndex++
	}

	if startDate != "" {
		query += " AND e.date >= $" + strconv.Itoa(argIndex)
		args = append(args, startDate)
		argIndex++
	}

	if endDate != "" {
		query += " AND e.date <= $" + strconv.Itoa(argIndex)
		args = append(args, endDate)
		argIndex++
	}

	query += " ORDER BY e.date DESC, e.created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expenses")
		return
	}
	defer rows.Close()

	type ExpenseWithUser struct {
		models.Expense
		AddedByName string `json:"added_by_name"`
	}

	expenses := []ExpenseWithUser{}
	totalAmount := 0.0
	totalByOwner := 0.0
	totalByContractor := 0.0
	categoryTotals := make(map[string]float64)

	for rows.Next() {
		var exp ExpenseWithUser
		err := rows.Scan(
			&exp.ID,
			&exp.ProjectID,
			&exp.Amount,
			&exp.Vendor,
			&exp.Date,
			&exp.Category,
			&exp.Description,
			&exp.PaidBy,
			&exp.ReceiptPhotoURL,
			&exp.AddedBy,
			&exp.CreatedAt,
			&exp.AddedByName,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to parse expense")
			return
		}

		expenses = append(expenses, exp)
		totalAmount += exp.Amount

		if exp.PaidBy == models.ExpensePaidByOwner {
			totalByOwner += exp.Amount
		} else if exp.PaidBy == models.ExpensePaidByContractor {
			totalByContractor += exp.Amount
		}

		categoryTotals[string(exp.Category)] += exp.Amount
	}

	summary := map[string]interface{}{
		"total_expenses":        totalAmount,
		"total_by_owner":        totalByOwner,
		"total_by_contractor":   totalByContractor,
		"breakdown_by_category": categoryTotals,
	}

	response := map[string]interface{}{
		"expenses": expenses,
		"summary":  summary,
	}

	respondWithJSON(w, http.StatusOK, response)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
