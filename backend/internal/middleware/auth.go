package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/juazsh/managrr/internal/utils"
)

type contextKey string

const UserContextKey contextKey = "user"

type UserContext struct {
	UserID   string
	Email    string
	UserType string
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			respondWithError(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		token := parts[1]
		claims, err := utils.ValidateToken(token)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		userCtx := UserContext{
			UserID:   claims.UserID,
			Email:    claims.Email,
			UserType: claims.UserType,
		}

		ctx := context.WithValue(r.Context(), UserContextKey, userCtx)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserFromContext(ctx context.Context) (UserContext, bool) {
	user, ok := ctx.Value(UserContextKey).(UserContext)
	return user, ok
}

func GetUserID(ctx context.Context) (string, bool) {
	userCtx, ok := GetUserFromContext(ctx)
	if !ok {
		return "", false
	}
	return userCtx.UserID, true
}

func GetUserType(ctx context.Context) (string, bool) {
	userCtx, ok := GetUserFromContext(ctx)
	if !ok {
		return "", false
	}
	return userCtx.UserType, true
}

func GetUserEmail(ctx context.Context) (string, bool) {
	userCtx, ok := GetUserFromContext(ctx)
	if !ok {
		return "", false
	}
	return userCtx.Email, true
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write([]byte(`{"error":"` + message + `"}`))
}
