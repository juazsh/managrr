package models

import "time"

type UpdateType string

const (
	UpdateTypeDailySummary UpdateType = "daily_summary"
	UpdateTypeWeeklyPlan   UpdateType = "weekly_plan"
)

type ProjectUpdate struct {
	ID         string     `json:"id"`
	ProjectID  string     `json:"project_id"`
	UpdateType UpdateType `json:"update_type"`
	Content    string     `json:"content"`
	CreatedBy  string     `json:"created_by"`
	CreatedAt  time.Time  `json:"created_at"`
}
