package storage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type SupabaseStorage struct {
	URL        string
	APIKey     string
	BucketName string
}

func NewSupabaseStorage() *SupabaseStorage {
	return &SupabaseStorage{
		URL:        os.Getenv("SUPABASE_URL"),
		APIKey:     os.Getenv("SUPABASE_KEY"),
		BucketName: "project-photos",
	}
}

func (s *SupabaseStorage) UploadFile(file multipart.File, header *multipart.FileHeader, projectID string) (string, error) {
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", projectID, time.Now().Unix(), ext)

	storageURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.URL, s.BucketName, filename)

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	req, err := http.NewRequest("POST", storageURL, bytes.NewReader(fileBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", header.Header.Get("Content-Type"))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Key string `json:"Key"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", s.URL, s.BucketName, filename)
	return publicURL, nil
}
