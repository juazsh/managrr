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
	"github.com/juazsh/managrr/internal/utils"
	"github.com/xuri/excelize/v2"
)

func AddExpense(w http.ResponseWriter, r *http.Request) {
	log.Println("=== AddExpense Handler Started ===")

	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		log.Println("ERROR: User not found in context")
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}
	log.Printf("User ID: %s, User Type: %s", userCtx.UserID, userCtx.UserType)

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		log.Printf("ERROR: Failed to parse multipart form: %v", err)
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}
	log.Println("Multipart form parsed successfully")

	projectID := r.FormValue("project_id")
	log.Printf("Project ID: %s", projectID)
	if projectID == "" {
		log.Println("ERROR: project_id is missing")
		respondWithError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	amount := r.FormValue("amount")
	log.Printf("Amount: %s", amount)
	if amount == "" {
		log.Println("ERROR: amount is missing")
		respondWithError(w, http.StatusBadRequest, "amount is required")
		return
	}

	date := r.FormValue("date")
	log.Printf("Date: %s", date)
	if date == "" {
		log.Println("ERROR: date is missing")
		respondWithError(w, http.StatusBadRequest, "date is required")
		return
	}

	category := r.FormValue("category")
	log.Printf("Category: %s", category)
	if category == "" {
		log.Println("ERROR: category is missing")
		respondWithError(w, http.StatusBadRequest, "category is required")
		return
	}

	if category != string(models.ExpenseCategoryMaterials) &&
		category != string(models.ExpenseCategoryLabor) &&
		category != string(models.ExpenseCategoryEquipment) &&
		category != string(models.ExpenseCategoryOther) {
		log.Printf("ERROR: Invalid category: %s", category)
		respondWithError(w, http.StatusBadRequest, "Invalid category. Must be one of: materials, labor, equipment, other")
		return
	}

	paidBy := r.FormValue("paid_by")
	log.Printf("Paid By: %s", paidBy)
	if paidBy == "" {
		log.Println("ERROR: paid_by is missing")
		respondWithError(w, http.StatusBadRequest, "paid_by is required")
		return
	}

	if paidBy != string(models.ExpensePaidByContractor) &&
		paidBy != string(models.ExpensePaidByOwner) {
		log.Printf("ERROR: Invalid paid_by: %s", paidBy)
		respondWithError(w, http.StatusBadRequest, "Invalid paid_by. Must be 'owner' or 'contractor'")
		return
	}

	db := database.GetDB()
	var ownerID, contractorID sql.NullString
	err := db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", projectID).Scan(&ownerID, &contractorID)
	if err != nil {
		log.Printf("ERROR: Failed to fetch project: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project access")
		return
	}
	log.Printf("Project found - Owner ID: %v, Contractor ID: %v", ownerID, contractorID)

	isOwner := ownerID.Valid && ownerID.String == userCtx.UserID
	isContractor := contractorID.Valid && contractorID.String == userCtx.UserID
	log.Printf("Access check - isOwner: %v, isContractor: %v", isOwner, isContractor)

	if !isOwner && !isContractor {
		log.Println("ERROR: User doesn't have access to this project")
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	amountFloat, err := parseFloat(amount)
	if err != nil || amountFloat <= 0 {
		log.Printf("ERROR: Invalid amount: %s, error: %v", amount, err)
		respondWithError(w, http.StatusBadRequest, "Invalid amount")
		return
	}
	log.Printf("Amount parsed: %f", amountFloat)

	var receiptPhotoURL *string
	file, header, err := r.FormFile("receipt_photo")
	if err == nil {
		defer file.Close()
		log.Printf("Receipt photo found - Filename: %s, Size: %d bytes", header.Filename, header.Size)

		ext := strings.ToLower(filepath.Ext(header.Filename))
		log.Printf("File extension: %s", ext)

		allowedExtensions := map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".gif":  true,
			".webp": true,
		}

		if !allowedExtensions[ext] {
			log.Printf("ERROR: Invalid file extension: %s", ext)
			respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
			return
		}

		log.Println("Creating Supabase storage client...")
		supabaseStorage := storage.NewSupabaseStorage()
		log.Printf("Supabase URL: %s", supabaseStorage.URL)
		log.Printf("Bucket Name: %s", supabaseStorage.BucketName)

		log.Println("Starting file upload...")
		uploadedURL, err := supabaseStorage.UploadFile(file, header, projectID)
		if err != nil {
			log.Printf("ERROR: File upload failed: %v", err)
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to upload receipt photo: %v", err))
			return
		}
		log.Printf("File uploaded successfully - URL: %s", uploadedURL)
		receiptPhotoURL = &uploadedURL
	} else {
		log.Printf("No receipt photo provided (error: %v)", err)
	}

	vendor := r.FormValue("vendor")
	description := r.FormValue("description")
	log.Printf("Vendor: %s, Description: %s", vendor, description)

	log.Println("Inserting expense into database...")
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
		log.Printf("ERROR: Failed to create expense in database: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create expense")
		return
	}

	log.Printf("Expense created successfully - ID: %s", expense.ID)

	participants, err := getProjectParticipants(db, projectID)
	if err == nil {
		userInfo, err := getUserInfo(db, userCtx.UserID)
		if err == nil {
			descText := description
			if descText == "" {
				descText = "No description"
			}

			if participants.ContractorEmail.Valid && participants.ContractorName.Valid {
				if userCtx.UserID != participants.ContractorID.String {
					err = utils.SendExpenseAddedNotification(
						participants.ContractorEmail.String,
						participants.ContractorName.String,
						userInfo.Name,
						userInfo.UserType,
						participants.ProjectTitle,
						amountFloat,
						category,
						descText,
					)
					if err != nil {
						log.Printf("Failed to send expense notification to contractor: %v", err)
					}
				}
			}

			if userCtx.UserID != participants.OwnerID {
				err = utils.SendExpenseAddedNotification(
					participants.OwnerEmail,
					participants.OwnerName,
					userInfo.Name,
					userInfo.UserType,
					participants.ProjectTitle,
					amountFloat,
					category,
					descText,
				)
				if err != nil {
					log.Printf("Failed to send expense notification to owner: %v", err)
				}
			}
		}
	}

	log.Println("=== AddExpense Handler Completed ===")
	respondWithJSON(w, http.StatusCreated, expense)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func parseFloat(s string) (float64, error) {
	var f float64
	_, err := fmt.Sscanf(s, "%f", &f)
	return f, err
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
	contractorFilter := r.URL.Query().Get("contractor_id")

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

	if contractorFilter != "" {
		query += " AND (e.added_by = $" + strconv.Itoa(argIndex) +
			" OR e.added_by IN (SELECT user_id FROM employees WHERE contractor_id = $" + strconv.Itoa(argIndex) + "))"
		args = append(args, contractorFilter)
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

func GetExpenseByID(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	userCtx := r.Context().Value(middleware.UserContextKey).(*middleware.UserContext)

	vars := mux.Vars(r)
	expenseID := vars["id"]

	var exp models.Expense
	var addedByName string
	err := db.QueryRow(`
		SELECT e.id, e.project_id, e.amount, e.vendor, e.date, e.category, e.description, 
		       e.paid_by, e.receipt_photo_url, e.added_by, e.created_at, u.name
		FROM expenses e
		JOIN users u ON e.added_by = u.id
		WHERE e.id = $1
	`, expenseID).Scan(
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
		&addedByName,
	)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Expense not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expense")
		return
	}

	var ownerID, contractorID sql.NullString
	err = db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", exp.ProjectID).Scan(&ownerID, &contractorID)
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

	response := map[string]interface{}{
		"id":                exp.ID,
		"project_id":        exp.ProjectID,
		"amount":            exp.Amount,
		"vendor":            exp.Vendor,
		"date":              exp.Date,
		"category":          exp.Category,
		"description":       exp.Description,
		"paid_by":           exp.PaidBy,
		"receipt_photo_url": exp.ReceiptPhotoURL,
		"added_by":          exp.AddedBy,
		"added_by_name":     addedByName,
		"created_at":        exp.CreatedAt,
	}

	respondWithJSON(w, http.StatusOK, response)
}

func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	userCtx := r.Context().Value(middleware.UserContextKey).(*middleware.UserContext)

	vars := mux.Vars(r)
	expenseID := vars["id"]

	var existing models.Expense
	err := db.QueryRow("SELECT id, project_id, added_by, receipt_photo_url FROM expenses WHERE id = $1", expenseID).
		Scan(&existing.ID, &existing.ProjectID, &existing.AddedBy, &existing.ReceiptPhotoURL)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Expense not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expense")
		return
	}

	if existing.AddedBy != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Only the creator can update this expense")
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

	receiptPhotoURL := existing.ReceiptPhotoURL
	file, header, err := r.FormFile("receipt_photo")
	if err == nil {
		defer file.Close()

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedExtensions[ext] {
			respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
			return
		}

		supabaseStorage := storage.NewSupabaseStorage()
		uploadedURL, err := supabaseStorage.UploadFile(file, header, existing.ProjectID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload receipt photo")
			return
		}
		receiptPhotoURL = &uploadedURL
	}

	vendor := r.FormValue("vendor")
	description := r.FormValue("description")

	_, err = db.Exec(`
		UPDATE expenses 
		SET amount = $1, vendor = $2, date = $3, category = $4, 
		    description = $5, paid_by = $6, receipt_photo_url = $7
		WHERE id = $8
	`, amountFloat, nilIfEmpty(vendor), date, category, nilIfEmpty(description), paidBy, receiptPhotoURL, expenseID)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update expense")
		return
	}

	participants, err := getProjectParticipants(db, existing.ProjectID)
	if err == nil {
		userInfo, err := getUserInfo(db, userCtx.UserID)
		if err == nil {
			descText := description
			if descText == "" {
				descText = "No description"
			}

			if participants.ContractorEmail.Valid && participants.ContractorName.Valid {
				if userCtx.UserID != participants.ContractorID.String {
					err = utils.SendExpenseUpdatedNotification(
						participants.ContractorEmail.String,
						participants.ContractorName.String,
						userInfo.Name,
						userInfo.UserType,
						participants.ProjectTitle,
						amountFloat,
						category,
						descText,
					)
					if err != nil {
						log.Printf("Failed to send expense update notification to contractor: %v", err)
					}
				}
			}

			if userCtx.UserID != participants.OwnerID {
				err = utils.SendExpenseUpdatedNotification(
					participants.OwnerEmail,
					participants.OwnerName,
					userInfo.Name,
					userInfo.UserType,
					participants.ProjectTitle,
					amountFloat,
					category,
					descText,
				)
				if err != nil {
					log.Printf("Failed to send expense update notification to owner: %v", err)
				}
			}
		}
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Expense updated successfully"})
}

func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	expenseID := vars["id"]

	var exp models.Expense
	err := db.QueryRow("SELECT id, project_id, added_by FROM expenses WHERE id = $1", expenseID).
		Scan(&exp.ID, &exp.ProjectID, &exp.AddedBy)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Expense not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expense")
		return
	}

	var ownerID sql.NullString
	err = db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", exp.ProjectID).Scan(&ownerID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project ownership")
		return
	}

	isCreator := exp.AddedBy == userCtx.UserID
	isProjectOwner := ownerID.Valid && ownerID.String == userCtx.UserID

	if !isCreator && !isProjectOwner {
		respondWithError(w, http.StatusForbidden, "Only the creator or project owner can delete this expense")
		return
	}

	_, err = db.Exec("DELETE FROM expenses WHERE id = $1", expenseID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete expense")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Expense deleted successfully"})
}

func DownloadExpensesExcel(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID, contractorID sql.NullString
	var projectName string
	err := db.QueryRow("SELECT owner_id, contractor_id, title FROM projects WHERE id = $1", projectID).
		Scan(&ownerID, &contractorID, &projectName)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	isOwner := ownerID.Valid && ownerID.String == userCtx.UserID
	isContractor := contractorID.Valid && contractorID.String == userCtx.UserID

	if !isOwner && !isContractor {
		respondWithError(w, http.StatusForbidden, "Only project owner or assigned contractor can download expenses")
		return
	}

	paidBy := r.URL.Query().Get("paid_by")
	category := r.URL.Query().Get("category")
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	if paidBy == "" {
		paidBy = "all"
	}

	query := `
		SELECT e.id, e.project_id, e.amount, e.vendor, e.date, e.category, e.description, 
		       e.paid_by, e.added_by, e.created_at, u.name
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

	f := excelize.NewFile()
	defer f.Close()

	sheetName := "Expenses"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create Excel sheet")
		return
	}
	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 12,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#4472C4"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})

	headers := []string{"Date", "Vendor", "Category", "Amount", "Paid By", "Description", "Added By"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	f.SetColWidth(sheetName, "A", "A", 12)
	f.SetColWidth(sheetName, "B", "B", 20)
	f.SetColWidth(sheetName, "C", "C", 15)
	f.SetColWidth(sheetName, "D", "D", 12)
	f.SetColWidth(sheetName, "E", "E", 15)
	f.SetColWidth(sheetName, "F", "F", 30)
	f.SetColWidth(sheetName, "G", "G", 20)

	rowIndex := 2
	totalAmount := 0.0
	totalByOwner := 0.0
	totalByContractor := 0.0

	for rows.Next() {
		var id, projectID, addedBy string
		var amount float64
		var vendor, date, category, description, paidBy, addedByName string
		var createdAt time.Time

		err := rows.Scan(&id, &projectID, &amount, &vendor, &date, &category, &description,
			&paidBy, &addedBy, &createdAt, &addedByName)
		if err != nil {
			continue
		}

		totalAmount += amount
		if paidBy == string(models.ExpensePaidByOwner) {
			totalByOwner += amount
		} else if paidBy == string(models.ExpensePaidByContractor) {
			totalByContractor += amount
		}

		categoryLabel := getCategoryLabel(category)
		paidByLabel := getPaidByLabel(paidBy)

		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowIndex), date)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowIndex), vendor)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowIndex), categoryLabel)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowIndex), amount)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowIndex), paidByLabel)
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowIndex), description)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", rowIndex), addedByName)

		rowIndex++
	}

	summaryStartRow := rowIndex + 2

	summaryStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 11,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E7E6E6"},
			Pattern: 1,
		},
	})

	f.SetCellValue(sheetName, fmt.Sprintf("C%d", summaryStartRow), "Total Spent:")
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", summaryStartRow), totalAmount)
	f.SetCellStyle(sheetName, fmt.Sprintf("C%d", summaryStartRow), fmt.Sprintf("D%d", summaryStartRow), summaryStyle)

	f.SetCellValue(sheetName, fmt.Sprintf("C%d", summaryStartRow+1), "Paid by Owner:")
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", summaryStartRow+1), totalByOwner)
	f.SetCellStyle(sheetName, fmt.Sprintf("C%d", summaryStartRow+1), fmt.Sprintf("D%d", summaryStartRow+1), summaryStyle)

	f.SetCellValue(sheetName, fmt.Sprintf("C%d", summaryStartRow+2), "Paid by Contractor:")
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", summaryStartRow+2), totalByContractor)
	f.SetCellStyle(sheetName, fmt.Sprintf("C%d", summaryStartRow+2), fmt.Sprintf("D%d", summaryStartRow+2), summaryStyle)

	timestamp := time.Now().Format("2006-01-02")
	filename := fmt.Sprintf("expenses-%s-%s.xlsx", utils.SanitizeFilename(projectName), timestamp)

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

	if err := f.Write(w); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate Excel file")
		return
	}
}

func getCategoryLabel(category string) string {
	switch category {
	case "materials":
		return "Materials"
	case "labor":
		return "Labor"
	case "equipment":
		return "Equipment"
	case "other":
		return "Other"
	default:
		return category
	}
}

func getPaidByLabel(paidBy string) string {
	switch paidBy {
	case "owner":
		return "Owner"
	case "contractor":
		return "Contractor"
	default:
		return paidBy
	}
}

// func GetProjectExpenses(w http.ResponseWriter, r *http.Request) {
// 	userCtx, ok := middleware.GetUserFromContext(r.Context())
// 	if !ok {
// 		respondWithError(w, http.StatusUnauthorized, "User not found in context")
// 		return
// 	}

// 	projectID := mux.Vars(r)["id"]
// 	if projectID == "" {
// 		respondWithError(w, http.StatusBadRequest, "Project ID is required")
// 		return
// 	}

// 	db := database.GetDB()

// 	var ownerID, contractorID sql.NullString
// 	err := db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", projectID).Scan(&ownerID, &contractorID)

// 	if err == sql.ErrNoRows {
// 		respondWithError(w, http.StatusNotFound, "Project not found")
// 		return
// 	}

// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
// 		return
// 	}

// 	isOwner := ownerID.Valid && ownerID.String == userCtx.UserID
// 	isContractor := contractorID.Valid && contractorID.String == userCtx.UserID

// 	if !isOwner && !isContractor {
// 		respondWithError(w, http.StatusForbidden, "Only project owner or assigned contractor can view expenses")
// 		return
// 	}

// 	paidBy := r.URL.Query().Get("paid_by")
// 	category := r.URL.Query().Get("category")
// 	startDate := r.URL.Query().Get("start_date")
// 	endDate := r.URL.Query().Get("end_date")

// 	if paidBy == "" {
// 		paidBy = "all"
// 	}

// 	if paidBy != "all" && paidBy != string(models.ExpensePaidByOwner) && paidBy != string(models.ExpensePaidByContractor) {
// 		respondWithError(w, http.StatusBadRequest, "Invalid paid_by filter")
// 		return
// 	}

// 	query := `
// 		SELECT e.id, e.project_id, e.amount, e.vendor, e.date, e.category, e.description,
// 		       e.paid_by, e.receipt_photo_url, e.added_by, e.created_at, u.name
// 		FROM expenses e
// 		JOIN users u ON e.added_by = u.id
// 		WHERE e.project_id = $1
// 	`
// 	args := []interface{}{projectID}
// 	argIndex := 2

// 	if paidBy != "all" {
// 		query += " AND e.paid_by = $" + strconv.Itoa(argIndex)
// 		args = append(args, paidBy)
// 		argIndex++
// 	}

// 	if category != "" {
// 		query += " AND e.category = $" + strconv.Itoa(argIndex)
// 		args = append(args, category)
// 		argIndex++
// 	}

// 	if startDate != "" {
// 		query += " AND e.date >= $" + strconv.Itoa(argIndex)
// 		args = append(args, startDate)
// 		argIndex++
// 	}

// 	if endDate != "" {
// 		query += " AND e.date <= $" + strconv.Itoa(argIndex)
// 		args = append(args, endDate)
// 		argIndex++
// 	}

// 	query += " ORDER BY e.date DESC, e.created_at DESC"

// 	rows, err := db.Query(query, args...)
// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expenses")
// 		return
// 	}
// 	defer rows.Close()

// 	type ExpenseWithUser struct {
// 		models.Expense
// 		AddedByName string `json:"added_by_name"`
// 	}

// 	expenses := []ExpenseWithUser{}
// 	totalAmount := 0.0
// 	totalByOwner := 0.0
// 	totalByContractor := 0.0
// 	categoryTotals := make(map[string]float64)

// 	for rows.Next() {
// 		var exp ExpenseWithUser
// 		err := rows.Scan(
// 			&exp.ID,
// 			&exp.ProjectID,
// 			&exp.Amount,
// 			&exp.Vendor,
// 			&exp.Date,
// 			&exp.Category,
// 			&exp.Description,
// 			&exp.PaidBy,
// 			&exp.ReceiptPhotoURL,
// 			&exp.AddedBy,
// 			&exp.CreatedAt,
// 			&exp.AddedByName,
// 		)
// 		if err != nil {
// 			respondWithError(w, http.StatusInternalServerError, "Failed to parse expense")
// 			return
// 		}

// 		expenses = append(expenses, exp)
// 		totalAmount += exp.Amount

// 		if exp.PaidBy == models.ExpensePaidByOwner {
// 			totalByOwner += exp.Amount
// 		} else if exp.PaidBy == models.ExpensePaidByContractor {
// 			totalByContractor += exp.Amount
// 		}

// 		categoryTotals[string(exp.Category)] += exp.Amount
// 	}

// 	summary := map[string]interface{}{
// 		"total_expenses":        totalAmount,
// 		"total_by_owner":        totalByOwner,
// 		"total_by_contractor":   totalByContractor,
// 		"breakdown_by_category": categoryTotals,
// 	}

// 	response := map[string]interface{}{
// 		"expenses": expenses,
// 		"summary":  summary,
// 	}

// 	respondWithJSON(w, http.StatusOK, response)
// }
