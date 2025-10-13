package models

import "time"

type ProjectUpdatePhoto struct {
	ID              string    `json:"id"`
	ProjectUpdateID string    `json:"project_update_id"`
	PhotoURL        string    `json:"photo_url"`
	Caption         *string   `json:"caption"`
	DisplayOrder    int       `json:"display_order"`
	CreatedAt       time.Time `json:"created_at"`
}
