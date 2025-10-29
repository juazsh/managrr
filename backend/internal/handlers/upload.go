package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
	"github.com/juazsh/managrr/internal/utils"
)

const maxFileSize = 5 * 1024 * 1024

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
}

func UploadProjectPhoto(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	var contractorID *string
	err := db.QueryRow("SELECT owner_id, contractor_id FROM projects WHERE id = $1", projectID).
		Scan(&ownerID, &contractorID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	canUpload := ownerID == userCtx.UserID ||
		(contractorID != nil && *contractorID == userCtx.UserID)

	if !canUpload {
		respondWithError(w, http.StatusForbidden, "Only project owner or assigned contractor can upload photos")
		return
	}

	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Photo file is required")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		respondWithError(w, http.StatusBadRequest, "Only JPG, JPEG, and PNG files are allowed")
		return
	}

	if header.Size > maxFileSize {
		respondWithError(w, http.StatusBadRequest, "File too large. Maximum size is 5MB")
		return
	}

	supabaseStorage := storage.NewSupabaseStorage()
	photoURL, err := supabaseStorage.UploadFile(file, header, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to upload photo")
		return
	}

	caption := r.FormValue("caption")
	var captionPtr *string
	if caption != "" {
		captionPtr = &caption
	}

	var photo models.ProjectPhoto
	query := `
		INSERT INTO project_photos (project_id, photo_url, uploaded_by, caption)
		VALUES ($1, $2, $3, $4)
		RETURNING id, project_id, photo_url, uploaded_by, caption, created_at
	`

	err = db.QueryRow(query, projectID, photoURL, userCtx.UserID, captionPtr).Scan(
		&photo.ID,
		&photo.ProjectID,
		&photo.PhotoURL,
		&photo.UploadedBy,
		&photo.Caption,
		&photo.CreatedAt,
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save photo record")
		return
	}

	participants, err := getProjectParticipants(db, projectID)
	if err == nil {
		userInfo, err := getUserInfo(db, userCtx.UserID)
		if err == nil {
			if userCtx.UserID == participants.OwnerID {
				if participants.ContractorEmail.Valid && participants.ContractorName.Valid {
					err = utils.SendPhotoUploadNotification(
						participants.ContractorEmail.String,
						participants.ContractorName.String,
						userInfo.Name,
						userInfo.UserType,
						participants.ProjectTitle,
					)
					if err != nil {
						log.Printf("Failed to send photo upload notification to contractor: %v", err)
					}
				}
			} else {
				err = utils.SendPhotoUploadNotification(
					participants.OwnerEmail,
					participants.OwnerName,
					userInfo.Name,
					userInfo.UserType,
					participants.ProjectTitle,
				)
				if err != nil {
					log.Printf("Failed to send photo upload notification to owner: %v", err)
				}
			}
		}
	}

	respondWithJSON(w, http.StatusCreated, photo)
}

func GetProjectPhotos(w http.ResponseWriter, r *http.Request) {
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	db := database.GetDB()

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	hasAccess := false
	switch userCtx.UserType {
	case string(models.UserTypeHouseOwner):
		hasAccess = ownerID == userCtx.UserID

	case string(models.UserTypeContractor):
		var isContractor bool
		db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM project_contractors 
				WHERE project_id = $1 AND contractor_id = $2
			)
		`, projectID, userCtx.UserID).Scan(&isContractor)
		hasAccess = isContractor

	case string(models.UserTypeEmployee):
		var count int
		err := db.QueryRow(`
			SELECT COUNT(*) FROM employee_projects
			WHERE employee_id = $1 AND project_id = $2
		`, userCtx.UserID, projectID).Scan(&count)
		if err == nil && count > 0 {
			hasAccess = true
		}
	}

	if !hasAccess {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT id, project_id, photo_url, uploaded_by, caption, created_at
		FROM project_photos
		WHERE project_id = $1
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query, projectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch photos")
		return
	}
	defer rows.Close()

	var photos []models.ProjectPhoto
	for rows.Next() {
		var photo models.ProjectPhoto
		err := rows.Scan(
			&photo.ID,
			&photo.ProjectID,
			&photo.PhotoURL,
			&photo.UploadedBy,
			&photo.Caption,
			&photo.CreatedAt,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan photo")
			return
		}
		photos = append(photos, photo)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating photos")
		return
	}

	if photos == nil {
		photos = []models.ProjectPhoto{}
	}

	respondWithJSON(w, http.StatusOK, photos)
}
