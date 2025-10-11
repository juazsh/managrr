package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

func AddEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can add employees")
		return
	}

	var req models.AddEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if !emailRegex.MatchString(req.Email) {
		respondWithError(w, http.StatusBadRequest, "Invalid email format")
		return
	}

	if req.HourlyRate <= 0 {
		respondWithError(w, http.StatusBadRequest, "Hourly rate must be positive")
		return
	}

	db := database.GetDB()

	var existingUserID string
	err := db.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&existingUserID)
	if err != sql.ErrNoRows {
		respondWithError(w, http.StatusConflict, "Email already registered")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	tempPassword, err := utils.GenerateRandomPassword()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate password")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to process password")
		return
	}

	var userID string
	userQuery := `
		INSERT INTO users (email, password_hash, name, phone, user_type, email_verified)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	err = tx.QueryRow(userQuery, req.Email, string(hashedPassword), req.Name, req.Phone, models.UserTypeEmployee, false).
		Scan(&userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create user account")
		return
	}

	var employee models.Employee
	employeeQuery := `
		INSERT INTO employees (contractor_id, user_id, name, email, phone, hourly_rate, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, contractor_id, user_id, name, email, phone, hourly_rate, is_active, created_at, updated_at
	`
	err = tx.QueryRow(employeeQuery, userCtx.UserID, userID, req.Name, req.Email, req.Phone, req.HourlyRate, true).
		Scan(&employee.ID, &employee.ContractorID, &employee.UserID, &employee.Name,
			&employee.Email, &employee.Phone, &employee.HourlyRate, &employee.IsActive,
			&employee.CreatedAt, &employee.UpdatedAt)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create employee")
		return
	}

	if err := tx.Commit(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	utils.SendEmployeeWelcomeEmail(req.Email, req.Name, tempPassword)

	respondWithJSON(w, http.StatusCreated, employee)
}

func ListEmployees(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can list employees")
		return
	}

	db := database.GetDB()
	query := `
		SELECT id, contractor_id, user_id, name, email, phone, hourly_rate, is_active, created_at, updated_at
		FROM employees
		WHERE contractor_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query, userCtx.UserID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch employees")
		return
	}
	defer rows.Close()

	var employees []models.Employee
	for rows.Next() {
		var employee models.Employee
		err := rows.Scan(
			&employee.ID,
			&employee.ContractorID,
			&employee.UserID,
			&employee.Name,
			&employee.Email,
			&employee.Phone,
			&employee.HourlyRate,
			&employee.IsActive,
			&employee.CreatedAt,
			&employee.UpdatedAt,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan employee")
			return
		}
		employees = append(employees, employee)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating employees")
		return
	}

	if employees == nil {
		employees = []models.Employee{}
	}

	respondWithJSON(w, http.StatusOK, employees)
}
