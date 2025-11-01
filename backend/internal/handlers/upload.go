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
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch project")
		return
	}

	isOwner := ownerID == userCtx.UserID
	var contractID string

	if isOwner {
		contractIDParam := r.FormValue("contract_id")
		if contractIDParam == "" {
			respondWithError(w, http.StatusBadRequest, "contract_id is required")
			return
		}

		var exists bool
		err = db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM contracts
				WHERE id = $1 AND project_id = $2 AND owner_id = $3
			)
		`, contractIDParam, projectID, userCtx.UserID).Scan(&exists)

		if err != nil || !exists {
			respondWithError(w, http.StatusBadRequest, "Invalid contract_id for this project")
			return
		}
		contractID = contractIDParam
	} else {
		contractQuery := `
			SELECT c.id
			FROM contracts c
			WHERE c.project_id = $1
			  AND (c.contractor_id = $2
			       OR c.contractor_id IN (
			           SELECT contractor_id FROM employees WHERE user_id = $2
			       ))
			LIMIT 1
		`
		err = db.QueryRow(contractQuery, projectID, userCtx.UserID).Scan(&contractID)
		if err != nil {
			respondWithError(w, http.StatusForbidden, "No contract found for this project")
			return
		}
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
		INSERT INTO project_photos (project_id, photo_url, uploaded_by, caption, contract_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, project_id, photo_url, uploaded_by, caption, created_at
	`

	err = db.QueryRow(query, projectID, photoURL, userCtx.UserID, captionPtr, contractID).Scan(
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

	isOwner := ownerID == userCtx.UserID

	var isContractor bool
	var contractorContractID string
	if !isOwner {
		err = db.QueryRow(`
			SELECT c.id
			FROM contracts c
			WHERE c.project_id = $1 AND c.contractor_id = $2
			LIMIT 1
		`, projectID, userCtx.UserID).Scan(&contractorContractID)

		if err == nil {
			isContractor = true
		}
	}

	if !isOwner && !isContractor {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	contractFilter := r.URL.Query().Get("contract_id")

	query := `
		SELECT id, project_id, photo_url, uploaded_by, caption, created_at
		FROM project_photos
		WHERE project_id = $1
	`

	args := []interface{}{projectID}

	if isContractor {
		query += " AND contract_id = $2"
		args = append(args, contractorContractID)
	} else if contractFilter != "" {
		query += " AND contract_id = $2"
		args = append(args, contractFilter)
	}

	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
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
