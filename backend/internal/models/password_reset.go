package models

import "time"

type PasswordReset struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	ResetToken string     `json:"-"`
	ExpiresAt  time.Time  `json:"expires_at"`
	CreatedAt  time.Time  `json:"created_at"`
	UsedAt     *time.Time `json:"used_at,omitempty"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}
