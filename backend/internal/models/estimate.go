package models

import "time"

type EstimateStatus string

const (
	EstimateStatusPending  EstimateStatus = "pending"
	EstimateStatusApproved EstimateStatus = "approved"
	EstimateStatusRejected EstimateStatus = "rejected"
)

type Estimate struct {
	ID              string          `json:"id"`
	ContractID      string          `json:"contract_id"`
	Amount          float64         `json:"amount"`
	Description     string          `json:"description"`
	SubmittedBy     string          `json:"submitted_by"`
	SubmittedAt     time.Time       `json:"submitted_at"`
	Status          EstimateStatus  `json:"status"`
	ApprovedBy      *string         `json:"approved_by,omitempty"`
	ApprovedAt      *time.Time      `json:"approved_at,omitempty"`
	RejectedAt      *time.Time      `json:"rejected_at,omitempty"`
	RejectionReason *string         `json:"rejection_reason,omitempty"`
	IsActive        bool            `json:"is_active"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type CreateEstimateRequest struct {
	ContractID  string  `json:"contract_id"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type ApproveEstimateRequest struct {
	SetAsActive bool `json:"set_as_active"`
}

type RejectEstimateRequest struct {
	Reason string `json:"reason"`
}
