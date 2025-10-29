package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/juazsh/managrr/internal/database"
	"github.com/juazsh/managrr/internal/middleware"
	"github.com/juazsh/managrr/internal/models"
	"github.com/juazsh/managrr/internal/storage"
	"github.com/juazsh/managrr/internal/utils"
)

const (
	maxUpdatePhotoSize = 5 << 20
	maxPhotosPerUpdate = 10
)

var allowedPhotoExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
}

func CreateProjectUpdate(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	userCtx, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	vars := mux.Vars(r)
	projectID := vars["id"]

	var isContractor bool
	err := db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM project_contractors 
			WHERE project_id = $1 AND contractor_id = $2
		)
	`, projectID, userCtx.UserID).Scan(&isContractor)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project")
		return
	}

	if !isContractor {
		respondWithError(w, http.StatusForbidden, "Only assigned contractors can post updates")
		return
	}

	if err := r.ParseMultipartForm(maxUpdatePhotoSize * maxPhotosPerUpdate); err != nil {
		respondWithError(w, http.StatusBadRequest, "Request too large")
		return
	}

	updateType := r.FormValue("update_type")
	if updateType == "" {
		respondWithError(w, http.StatusBadRequest, "update_type is required")
		return
	}

	if updateType != string(models.UpdateTypeDailySummary) && updateType != string(models.UpdateTypeWeeklyPlan) {
		respondWithError(w, http.StatusBadRequest, "Invalid update_type. Must be 'daily_summary' or 'weekly_plan'")
		return
	}

	content := r.FormValue("content")
	if content == "" {
		respondWithError(w, http.StatusBadRequest, "content is required")
		return
	}

	updateID := uuid.New().String()

	_, err = db.Exec(`
		INSERT INTO project_updates (id, project_id, update_type, content, created_by)
		VALUES ($1, $2, $3, $4, $5)
	`, updateID, projectID, updateType, content, userCtx.UserID)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create update")
		return
	}

	files := r.MultipartForm.File["photos[]"]
	captions := r.Form["captions[]"]

	if len(files) > maxPhotosPerUpdate {
		respondWithError(w, http.StatusBadRequest, "Maximum 10 photos allowed per update")
		return
	}

	supabaseStorage := storage.NewSupabaseStorage()

	for i, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Failed to read photo file")
			return
		}
		defer file.Close()

		if fileHeader.Size > maxUpdatePhotoSize {
			respondWithError(w, http.StatusBadRequest, "Photo size exceeds 5MB limit")
			return
		}

		ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if !allowedPhotoExtensions[ext] {
			respondWithError(w, http.StatusBadRequest, "Invalid photo type. Allowed: jpg, jpeg, png")
			return
		}

		photoURL, err := supabaseStorage.UploadUpdatePhoto(file, fileHeader, projectID)
		if err != nil {
			log.Printf("ERROR CreateProjectUpdate: Failed to upload photo: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to upload photo")
			return
		}

		var caption *string
		if i < len(captions) && captions[i] != "" {
			caption = &captions[i]
		}

		photoID := uuid.New().String()
		_, err = db.Exec(`
			INSERT INTO project_update_photos (id, project_update_id, photo_url, caption, display_order)
			VALUES ($1, $2, $3, $4, $5)
		`, photoID, updateID, photoURL, caption, i)

		if err != nil {
			log.Printf("ERROR CreateProjectUpdate: Failed to save photo metadata: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to save photo metadata")
			return
		}
	}

	participants, err := getProjectParticipants(db, projectID)
	if err == nil {
		userInfo, err := getUserInfo(db, userCtx.UserID)
		if err == nil {
			err = utils.SendProjectUpdateNotification(
				participants.OwnerEmail,
				participants.OwnerName,
				userInfo.Name,
				participants.ProjectTitle,
				updateType,
				content,
			)
			if err != nil {
				log.Printf("Failed to send project update notification to owner: %v", err)
			}
		}
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Update created successfully",
		"id":      updateID,
	})
}

func GetProjectUpdates(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	userCtx := r.Context().Value(middleware.UserContextKey).(*middleware.UserContext)

	vars := mux.Vars(r)
	projectID := vars["id"]

	var ownerID string
	err := db.QueryRow("SELECT owner_id FROM projects WHERE id = $1", projectID).Scan(&ownerID)

	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Project not found")
		return
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify project")
		return
	}

	isOwner := ownerID == userCtx.UserID

	var isContractor bool
	db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM project_contractors 
			WHERE project_id = $1 AND contractor_id = $2
		)
	`, projectID, userCtx.UserID).Scan(&isContractor)

	if !isOwner && !isContractor {
		respondWithError(w, http.StatusForbidden, "Access denied")
		return
	}

	query := `
		SELECT pu.id, pu.project_id, pu.update_type, pu.content, pu.created_by, pu.created_at, u.name
		FROM project_updates pu
		JOIN users u ON pu.created_by = u.id
		WHERE pu.project_id = $1
	`

	args := []interface{}{projectID}

	updateTypeFilter := r.URL.Query().Get("type")
	if updateTypeFilter != "" {
		if updateTypeFilter != string(models.UpdateTypeDailySummary) && updateTypeFilter != string(models.UpdateTypeWeeklyPlan) {
			respondWithError(w, http.StatusBadRequest, "Invalid type filter")
			return
		}
		query += " AND pu.update_type = $2"
		args = append(args, updateTypeFilter)
	}

	query += " ORDER BY pu.created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch updates")
		return
	}
	defer rows.Close()

	type UpdateResponse struct {
		ID         string                      `json:"id"`
		ProjectID  string                      `json:"project_id"`
		UpdateType models.UpdateType           `json:"update_type"`
		Content    string                      `json:"content"`
		CreatedBy  map[string]string           `json:"created_by"`
		Photos     []models.ProjectUpdatePhoto `json:"photos"`
		CreatedAt  string                      `json:"created_at"`
	}

	updates := []UpdateResponse{}

	for rows.Next() {
		var update UpdateResponse
		var createdByID, createdByName string
		var createdAt string

		err := rows.Scan(
			&update.ID,
			&update.ProjectID,
			&update.UpdateType,
			&update.Content,
			&createdByID,
			&createdAt,
			&createdByName,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan update")
			return
		}

		update.CreatedBy = map[string]string{
			"id":   createdByID,
			"name": createdByName,
		}
		update.CreatedAt = createdAt

		photoRows, err := db.Query(`
			SELECT id, photo_url, caption, display_order, created_at
			FROM project_update_photos
			WHERE project_update_id = $1
			ORDER BY display_order ASC
		`, update.ID)
		if err != nil {
			log.Printf("Failed to fetch photos for update %s: %v", update.ID, err)
			update.Photos = []models.ProjectUpdatePhoto{}
		} else {
			photos := []models.ProjectUpdatePhoto{}
			for photoRows.Next() {
				var photo models.ProjectUpdatePhoto
				var caption sql.NullString
				err := photoRows.Scan(
					&photo.ID,
					&photo.PhotoURL,
					&caption,
					&photo.DisplayOrder,
					&photo.CreatedAt,
				)
				if err != nil {
					log.Printf("Failed to scan photo: %v", err)
					continue
				}
				if caption.Valid {
					photo.Caption = &caption.String
				}
				photos = append(photos, photo)
			}
			photoRows.Close()
			update.Photos = photos
		}

		updates = append(updates, update)
	}

	if err = rows.Err(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error iterating updates")
		return
	}

	if updates == nil {
		updates = []UpdateResponse{}
	}

	respondWithJSON(w, http.StatusOK, updates)
}
