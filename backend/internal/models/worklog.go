package models

import (
	"time"
)

type WorkLog struct {
	ID                string     `json:"id"`
	EmployeeID        string     `json:"employee_id"`
	ProjectID         string     `json:"project_id"`
	CheckInTime       time.Time  `json:"check_in_time"`
	CheckOutTime      *time.Time `json:"check_out_time,omitempty"`
	CheckInPhotoURL   string     `json:"check_in_photo_url"`
	CheckOutPhotoURL  *string    `json:"check_out_photo_url,omitempty"`
	CheckInLatitude   *float64   `json:"check_in_latitude,omitempty"`
	CheckInLongitude  *float64   `json:"check_in_longitude,omitempty"`
	CheckOutLatitude  *float64   `json:"check_out_latitude,omitempty"`
	CheckOutLongitude *float64   `json:"check_out_longitude,omitempty"`
	HoursWorked       *float64   `json:"hours_worked,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}

type CheckInRequest struct {
	ProjectID int      `json:"project_id"`
	Latitude  *float64 `json:"latitude,omitempty"`
	Longitude *float64 `json:"longitude,omitempty"`
}
