import React, { useState } from 'react';
import projectService from '../../services/projectService';
import { theme } from '../../theme';

const PhotosSection = ({ projectId, photos, canUpload, onPhotoUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a photo');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await projectService.uploadProjectPhoto(projectId, selectedFile, caption);
      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
      setShowUploadForm(false);
      onPhotoUploaded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl(null);
    setShowUploadForm(false);
    setError('');
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Progress Photos</h2>
        {canUpload && !showUploadForm && (
          <button onClick={() => setShowUploadForm(true)} style={styles.uploadButton}>
            + Upload Photo
          </button>
        )}
      </div>

      {showUploadForm && (
        <div style={styles.uploadForm}>
          <h3 style={styles.formTitle}>Upload New Photo</h3>
          
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={styles.fileInput}
              />
            </label>
          </div>

          {previewUrl && (
            <div style={styles.preview}>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Caption (optional)
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a description..."
                style={styles.input}
              />
            </label>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={handleCancel}
              style={styles.cancelButton}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              style={styles.submitButton}
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {photos && photos.length > 0 ? (
        <div style={styles.photosGrid}>
          {photos.map((photo) => (
            <div key={photo.id} style={styles.photoCard}>
              <img src={photo.photo_url} alt={photo.caption || 'Project photo'} style={styles.photo} />
              {photo.caption && <p style={styles.photoCaption}>{photo.caption}</p>}
              <p style={styles.photoDate}>
                {new Date(photo.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No photos uploaded yet</p>
          {canUpload && !showUploadForm && (
            <button onClick={() => setShowUploadForm(true)} style={styles.emptyButton}>
              Upload First Photo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  uploadButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  uploadForm: {
    backgroundColor: theme.colors.backgroundLight,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: '0.75rem',
    borderRadius: theme.borderRadius.sm,
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: '0.5rem',
  },
  fileInput: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    marginTop: '0.5rem',
  },
  preview: {
    marginBottom: '1rem',
  },
  previewImage: {
    maxWidth: '300px',
    maxHeight: '300px',
    borderRadius: theme.borderRadius.md,
    objectFit: 'cover',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  photoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    boxShadow: theme.shadows.sm,
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
    },
  },
  photo: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  photoCaption: {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: theme.colors.text,
    margin: 0,
  },
  photoDate: {
    padding: '0 0.75rem 0.75rem',
    fontSize: '0.75rem',
    color: theme.colors.textLight,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    marginBottom: '1rem',
  },
  emptyButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default PhotosSection;