package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if !emailRegex.MatchString(req.Email) {
		respondWithError(w, http.StatusBadRequest, "Invalid email format")
		return
	}

	if len(req.Password) < 8 {
		respondWithError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if req.UserType != models.UserTypeHouseOwner &&
		req.UserType != models.UserTypeContractor &&
		req.UserType != models.UserTypeEmployee {
		respondWithError(w, http.StatusBadRequest, "Invalid user type")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to process password")
		return
	}

	verificationToken, err := utils.GenerateVerificationToken()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate verification token")
		return
	}

	tokenExpiry := time.Now().Add(24 * time.Hour)

	db := database.GetDB()
	var user models.User

	query := `
		INSERT INTO users (email, password_hash, name, phone, user_type, email_verified, verification_token, verification_token_expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, email, name, phone, user_type, email_verified, created_at, updated_at
	`

	err = db.QueryRow(query, req.Email, string(hashedPassword), req.Name, req.Phone, req.UserType, false, verificationToken, tokenExpiry).
		Scan(&user.ID, &user.Email, &user.Name, &user.Phone, &user.UserType, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint \"users_email_key\"" {
			respondWithError(w, http.StatusConflict, "Email already registered")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	if err := utils.SendVerificationEmail(user.Email, verificationToken); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to send verification email")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Registration successful. Please check your email to verify your account.",
		"user":    user,
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	db := database.GetDB()
	var user models.User
	var passwordHash string

	query := `
		SELECT id, email, password_hash, name, phone, user_type, email_verified, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	err := db.QueryRow(query, req.Email).
		Scan(&user.ID, &user.Email, &passwordHash, &user.Name, &user.Phone, &user.UserType, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to query user")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if !user.EmailVerified {
		respondWithError(w, http.StatusForbidden, "Please verify your email before logging in")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, string(user.UserType))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondWithJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		respondWithError(w, http.StatusBadRequest, "Verification token is required")
		return
	}

	db := database.GetDB()

	query := `
		UPDATE users
		SET email_verified = true,
		    verification_token = NULL,
		    verification_token_expires_at = NULL,
		    updated_at = NOW()
		WHERE verification_token = $1
		  AND verification_token_expires_at > NOW()
		  AND email_verified = false
		RETURNING id, email
	`

	var userID, email string
	err := db.QueryRow(query, token).Scan(&userID, &email)

	if err != nil {
		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusBadRequest, "Invalid or expired verification token")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to verify email")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Email verified successfully. You can now log in.",
	})
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	db := database.GetDB()
	var user models.User

	query := `
		SELECT id, email, name, phone, user_type, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := db.QueryRow(query, userCtx.UserID).
		Scan(&user.ID, &user.Email, &user.Name, &user.Phone, &user.UserType, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusNotFound, "User not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to query user")
		return
	}

	respondWithJSON(w, http.StatusOK, user)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
