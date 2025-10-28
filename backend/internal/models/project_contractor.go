package models

import "time"

type ProjectContractor struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id"`
	ContractorID string    `json:"contractor_id"`
	AssignedAt   time.Time `json:"assigned_at"`
}
