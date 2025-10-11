package models

import "time"

type Employee struct {
	ID           string    `json:"id"`
	ContractorID string    `json:"contractor_id"`
	UserID       string    `json:"user_id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Phone        *string   `json:"phone,omitempty"`
	HourlyRate   float64   `json:"hourly_rate"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type AddEmployeeRequest struct {
	Name       string  `json:"name"`
	Email      string  `json:"email"`
	Phone      *string `json:"phone,omitempty"`
	HourlyRate float64 `json:"hourly_rate"`
}

type UpdateEmployeeRequest struct {
	Name       string  `json:"name"`
	Phone      *string `json:"phone,omitempty"`
	HourlyRate float64 `json:"hourly_rate"`
}

type AssignProjectRequest struct {
	ProjectID string `json:"project_id"`
}

type AssignedProject struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type EmployeeWithProjects struct {
	Employee
	AssignedProjects []AssignedProject `json:"assigned_projects"`
}
