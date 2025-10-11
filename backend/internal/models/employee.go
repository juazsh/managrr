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
