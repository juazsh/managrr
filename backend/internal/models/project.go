package models

import (
	"time"
)

type ProjectStatus string

const (
	ProjectStatusDraft     ProjectStatus = "draft"
	ProjectStatusActive    ProjectStatus = "active"
	ProjectStatusCompleted ProjectStatus = "completed"
)

type Project struct {
	ID            string        `json:"id"`
	OwnerID       string        `json:"owner_id"`
	ContractorID  *string       `json:"contractor_id,omitempty"`
	Title         string        `json:"title"`
	Description   string        `json:"description"`
	EstimatedCost float64       `json:"estimated_cost"`
	Address       *string       `json:"address,omitempty"`
	Status        ProjectStatus `json:"status"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}

type CreateProjectRequest struct {
	Title         string  `json:"title"`
	Description   string  `json:"description"`
	EstimatedCost float64 `json:"estimated_cost"`
	Address       *string `json:"address,omitempty"`
}

type UpdateProjectRequest struct {
	Title         *string        `json:"title,omitempty"`
	Description   *string        `json:"description,omitempty"`
	EstimatedCost *float64       `json:"estimated_cost,omitempty"`
	Address       *string        `json:"address,omitempty"`
	Status        *ProjectStatus `json:"status,omitempty"`
}
