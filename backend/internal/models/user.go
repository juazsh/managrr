package models

import (
	"time"
)

type UserType string

const (
	UserTypeHouseOwner UserType = "house_owner"
	UserTypeContractor UserType = "contractor"
	UserTypeEmployee   UserType = "employee"
)

type User struct {
	ID                         string     `json:"id"`
	Email                      string     `json:"email"`
	Phone                      *string    `json:"phone,omitempty"`
	PasswordHash               string     `json:"-"`
	UserType                   UserType   `json:"user_type"`
	Name                       string     `json:"name"`
	EmailVerified              bool       `json:"email_verified"`
	VerificationToken          *string    `json:"-"`
	VerificationTokenExpiresAt *time.Time `json:"-"`
	CreatedAt                  time.Time  `json:"created_at"`
	UpdatedAt                  time.Time  `json:"updated_at"`
}

type RegisterRequest struct {
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Name     string   `json:"name"`
	Phone    *string  `json:"phone,omitempty"`
	UserType UserType `json:"user_type"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
