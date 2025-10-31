package models

import "time"

type ContractStatus string

const (
	ContractStatusPending    ContractStatus = "pending"
	ContractStatusActive     ContractStatus = "active"
	ContractStatusCompleted  ContractStatus = "completed"
	ContractStatusTerminated ContractStatus = "terminated"
)

type Contract struct {
	ID           string          `json:"id"`
	ProjectID    string          `json:"project_id"`
	ContractorID string          `json:"contractor_id"`
	OwnerID      string          `json:"owner_id"`
	Status       ContractStatus  `json:"status"`
	StartDate    *time.Time      `json:"start_date,omitempty"`
	EndDate      *time.Time      `json:"end_date,omitempty"`
	Terms        *string         `json:"terms,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

type CreateContractRequest struct {
	ProjectID    string     `json:"project_id"`
	ContractorID string     `json:"contractor_id"`
	StartDate    *time.Time `json:"start_date,omitempty"`
	Terms        *string    `json:"terms,omitempty"`
}

type UpdateContractStatusRequest struct {
	Status  ContractStatus `json:"status"`
	EndDate *time.Time     `json:"end_date,omitempty"`
}
