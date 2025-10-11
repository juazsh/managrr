package models

import "time"

type ProjectPhoto struct {
	ID         string    `json:"id"`
	ProjectID  string    `json:"project_id"`
	PhotoURL   string    `json:"photo_url"`
	UploadedBy string    `json:"uploaded_by"`
	Caption    *string   `json:"caption,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type UploadPhotoRequest struct {
	Caption *string `json:"caption,omitempty"`
}
