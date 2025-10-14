package storage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
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
	log.Printf("=== UploadFile Started ===")
	log.Printf("Project ID: %s", projectID)
	log.Printf("Original Filename: %s", header.Filename)

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", projectID, time.Now().Unix(), ext)
	log.Printf("Generated Filename: %s", filename)

	storageURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.URL, s.BucketName, filename)
	log.Printf("Storage URL: %s", storageURL)

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		log.Printf("ERROR: Failed to read file: %v", err)
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	log.Printf("File size: %d bytes", len(fileBytes))

	req, err := http.NewRequest("POST", storageURL, bytes.NewReader(fileBytes))
	if err != nil {
		log.Printf("ERROR: Failed to create request: %v", err)
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", header.Header.Get("Content-Type"))
	log.Printf("Request headers - Content-Type: %s", header.Header.Get("Content-Type"))

	log.Println("Sending request to Supabase...")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("ERROR: Failed to execute request: %v", err)
		return "", fmt.Errorf("failed to upload file: %w", err)
	}
	defer resp.Body.Close()

	log.Printf("Response Status: %d", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		bodyStr := string(body)
		log.Printf("ERROR: Upload failed - Status: %d, Body: %s", resp.StatusCode, bodyStr)
		return "", fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, bodyStr)
	}

	body, _ := io.ReadAll(resp.Body)
	log.Printf("Success response body: %s", string(body))

	var result struct {
		Key string `json:"Key"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("ERROR: Failed to decode response: %v", err)
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", s.URL, s.BucketName, filename)
	log.Printf("Generated public URL: %s", publicURL)
	log.Println("=== UploadFile Completed Successfully ===")
	return publicURL, nil
}

func (s *SupabaseStorage) UploadUpdatePhoto(file multipart.File, header *multipart.FileHeader, projectID string) (string, error) {
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", projectID, time.Now().Unix(), ext)

	storageURL := fmt.Sprintf("%s/storage/v1/object/project-update-photos/%s", s.URL, filename)

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

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/project-update-photos/%s", s.URL, filename)
	return publicURL, nil
}

func (s *SupabaseStorage) UploadReceiptPhoto(file multipart.File, header *multipart.FileHeader, projectID string) (string, error) {
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", projectID, time.Now().Unix(), ext)

	storageURL := fmt.Sprintf("%s/storage/v1/object/receipts/%s", s.URL, filename)

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

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/receipts/%s", s.URL, filename)
	return publicURL, nil
}
