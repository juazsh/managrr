package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

func ListEmployees(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		log.Printf("ERROR ListEmployees: User not found in context")
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		log.Printf("ERROR ListEmployees: User type is %s, not contractor", userCtx.UserType)
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
		log.Printf("ERROR ListEmployees: Failed to query database: %v", err)
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
			log.Printf("ERROR ListEmployees: Failed to scan employee: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to scan employee")
			return
		}
		employees = append(employees, employee)
	}

	if err = rows.Err(); err != nil {
		log.Printf("ERROR ListEmployees: Error iterating employees: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Error iterating employees")
		return
	}

	if employees == nil {
		employees = []models.Employee{}
	}

	log.Printf("SUCCESS ListEmployees: Returning %d employees", len(employees))
	respondWithJSON(w, http.StatusOK, employees)
}

func AddEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		log.Printf("ERROR AddEmployee: User not found in context")
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		log.Printf("ERROR AddEmployee: User type is %s, not contractor", userCtx.UserType)
		respondWithError(w, http.StatusForbidden, "Only contractors can add employees")
		return
	}

	var req models.AddEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("ERROR AddEmployee: Invalid request body: %v", err)
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
		log.Printf("ERROR AddEmployee: Failed to start transaction: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	tempPassword, err := utils.GenerateRandomPassword()
	if err != nil {
		log.Printf("ERROR AddEmployee: Failed to generate password: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to generate password")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("ERROR AddEmployee: Failed to hash password: %v", err)
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
		log.Printf("ERROR AddEmployee: Failed to create user account: %v", err)
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
		log.Printf("ERROR AddEmployee: Failed to create employee: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create employee")
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("ERROR AddEmployee: Failed to commit transaction: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	utils.SendEmployeeWelcomeEmail(req.Email, req.Name, tempPassword)

	log.Printf("SUCCESS AddEmployee: Created employee %s with ID %s", req.Name, employee.ID)
	respondWithJSON(w, http.StatusCreated, employee)
}

func GetEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can view employees")
		return
	}

	vars := mux.Vars(r)
	employeeID := vars["id"]
	if employeeID == "" {
		respondWithError(w, http.StatusBadRequest, "Employee ID is required")
		return
	}

	db := database.GetDB()
	query := `
		SELECT id, contractor_id, user_id, name, email, phone, hourly_rate, is_active, created_at, updated_at
		FROM employees
		WHERE id = $1
	`

	var employee models.Employee
	err := db.QueryRow(query, employeeID).Scan(
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

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Employee not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch employee")
		return
	}

	if employee.ContractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	projectQuery := `
    SELECT p.id, p.title
    FROM projects p
    INNER JOIN employee_projects ep ON p.id = ep.project_id
    WHERE ep.employee_id = $1
    ORDER BY ep.assigned_at DESC
`
	projectRows, err := db.Query(projectQuery, employeeID)
	if err != nil {
		log.Printf("ERROR GetEmployee: Failed to fetch assigned projects: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch assigned projects")
		return
	}
	defer projectRows.Close()

	var projects []models.AssignedProject
	for projectRows.Next() {
		var project models.AssignedProject
		if err := projectRows.Scan(&project.ID, &project.Name); err != nil {
			log.Printf("ERROR GetEmployee: Failed to fetch assigned projects: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to scan project")
			return
		}
		projects = append(projects, project)
	}

	if projects == nil {
		projects = []models.AssignedProject{}
	}

	response := models.EmployeeWithProjects{
		Employee:         employee,
		AssignedProjects: projects,
	}

	respondWithJSON(w, http.StatusOK, response)
}

func UpdateEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can update employees")
		return
	}

	vars := mux.Vars(r)
	employeeID := vars["id"]
	if employeeID == "" {
		respondWithError(w, http.StatusBadRequest, "Employee ID is required")
		return
	}

	var req models.UpdateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if req.HourlyRate <= 0 {
		respondWithError(w, http.StatusBadRequest, "Hourly rate must be positive")
		return
	}

	db := database.GetDB()

	var contractorID string
	err := db.QueryRow("SELECT contractor_id FROM employees WHERE id = $1", employeeID).Scan(&contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Employee not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify employee ownership")
		return
	}

	if contractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
    UPDATE employees 
    SET name = $1, phone = $2, hourly_rate = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, contractor_id, user_id, name, email, phone, hourly_rate, is_active, created_at, updated_at
`

	var employee models.Employee
	err = db.QueryRow(query, req.Name, req.Phone, req.HourlyRate, employeeID).Scan(
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
		respondWithError(w, http.StatusInternalServerError, "Failed to update employee")
		return
	}

	respondWithJSON(w, http.StatusOK, employee)
}

func DeleteEmployee(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can delete employees")
		return
	}

	vars := mux.Vars(r)
	employeeID := vars["id"]
	if employeeID == "" {
		respondWithError(w, http.StatusBadRequest, "Employee ID is required")
		return
	}

	db := database.GetDB()

	var contractorID string
	err := db.QueryRow("SELECT contractor_id FROM employees WHERE id = $1", employeeID).Scan(&contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Employee not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify employee ownership")
		return
	}

	if contractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `UPDATE employees SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err = db.Exec(query, employeeID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete employee")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Employee deleted successfully"})
}

func AssignProject(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	if userCtx.UserType != string(models.UserTypeContractor) {
		respondWithError(w, http.StatusForbidden, "Only contractors can assign projects")
		return
	}

	vars := mux.Vars(r)
	employeeID := vars["id"]
	if employeeID == "" {
		respondWithError(w, http.StatusBadRequest, "Employee ID is required")
		return
	}

	var req models.AssignProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.ProjectID == "" {
		respondWithError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	db := database.GetDB()

	var contractorID string
	err := db.QueryRow("SELECT contractor_id FROM employees WHERE id = $1", employeeID).Scan(&contractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Employee not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify employee ownership")
		return
	}

	if contractorID != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	var projectContractorID sql.NullString
	err = db.QueryRow("SELECT contractor_id FROM projects WHERE id = $1", req.ProjectID).Scan(&projectContractorID)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project")
		return
	}

	if !projectContractorID.Valid || projectContractorID.String != userCtx.UserID {
		respondWithError(w, http.StatusForbidden, "You can only assign employees to your own projects")
		return
	}

	query := `
		INSERT INTO employee_projects (employee_id, project_id, assigned_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (employee_id, project_id) DO NOTHING
	`
	_, err = db.Exec(query, employeeID, req.ProjectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to assign project")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Project assigned successfully"})
}
