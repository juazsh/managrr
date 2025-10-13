import React, { useState } from 'react';
import projectService from '../services/projectService';
import { theme } from '../theme';

const PhotoUploadSection = ({ projectId, photos, onPhotoUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a photo');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const photo = await projectService.uploadProjectPhoto(projectId, selectedFile, caption);
      onPhotoUploaded(photo);
      setSelectedFile(null);
      setCaption('');
      document.getElementById('photo-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: {
      background: theme.colors.white,
      padding: '2rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
    },
    title: {
      margin: '0 0 1.5rem 0',
      color: theme.colors.text,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
    },
    uploadForm: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    },
    fileInputWrapper: {
      position: 'relative',
    },
    fileInput: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0,
    },
    fileLabel: {
      display: 'inline-block',
      padding: '0.75rem 1.5rem',
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.text,
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
    captionInput: {
      flex: 1,
      minWidth: '200px',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
    },
    uploadButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: theme.colors.black,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
    uploadButtonDisabled: {
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.textMuted,
      cursor: 'not-allowed',
    },
    error: {
      backgroundColor: theme.colors.errorLight,
      color: theme.colors.error,
      padding: '0.75rem',
      borderRadius: theme.borderRadius.md,
      marginBottom: '1rem',
      fontSize: theme.typography.small.fontSize,
      border: `1px solid ${theme.colors.error}`,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    },
    noPhotos: {
      textAlign: 'center',
      color: theme.colors.textMuted,
      padding: '3rem',
      fontSize: theme.typography.body.fontSize,
    },
    photoItem: {
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    photoImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      display: 'block',
    },
    photoCaption: {
      padding: '0.75rem',
      fontSize: theme.typography.small.fontSize,
      color: theme.colors.text,
    },
    photoDate: {
      padding: '0 0.75rem 0.75rem',
      fontSize: theme.typography.tiny.fontSize,
      color: theme.colors.textMuted,
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modalContent: {
      position: 'relative',
      maxWidth: '90%',
      maxHeight: '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    modalImage: {
      maxWidth: '100%',
      maxHeight: '70vh',
      objectFit: 'contain',
      borderRadius: theme.borderRadius.md,
    },
    closeButton: {
      position: 'absolute',
      top: '-40px',
      right: 0,
      background: 'transparent',
      border: 'none',
      color: theme.colors.white,
      fontSize: '40px',
      cursor: 'pointer',
      lineHeight: 1,
    },
    modalCaption: {
      color: theme.colors.white,
      marginTop: '1rem',
      fontSize: theme.typography.body.fontSize,
      textAlign: 'center',
    },
    photoNav: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
      marginTop: '1.5rem',
    },
    navButton: {
      padding: '0.5rem 1rem',
      backgroundColor: theme.colors.white,
      color: theme.colors.text,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      fontSize: theme.typography.small.fontSize,
      fontWeight: '600',
    },
    navButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    navText: {
      color: theme.colors.white,
      fontSize: theme.typography.small.fontSize,
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Project Photos</h2>

      <div style={styles.uploadForm}>
        <div style={styles.fileInputWrapper}>
          <input
            type="file"
            id="photo-input"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            disabled={uploading}
            style={styles.fileInput}
          />
          <label htmlFor="photo-input" style={styles.fileLabel}>
            {selectedFile ? selectedFile.name : 'Choose Photo'}
          </label>
        </div>

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
          style={styles.captionInput}
        />

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            ...styles.uploadButton,
            ...(!selectedFile || uploading ? styles.uploadButtonDisabled : {}),
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {photos.length === 0 ? (
          <p style={styles.noPhotos}>No photos uploaded yet</p>
        ) : (
          photos.map((photo, index) => (
            <div
              key={photo.id}
              style={styles.photoItem}
              onClick={() => setSelectedPhotoIndex(index)}
            >
              <img src={photo.photo_url} alt={photo.caption || 'Project photo'} style={styles.photoImage} />
              {photo.caption && <p style={styles.photoCaption}>{photo.caption}</p>}
              <p style={styles.photoDate}>
                {new Date(photo.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedPhotoIndex !== null && (
        <div
          style={styles.modal}
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={() => setSelectedPhotoIndex(null)}
            >
              ×
            </button>
            <img
              src={photos[selectedPhotoIndex].photo_url}
              alt={photos[selectedPhotoIndex].caption || 'Project photo'}
              style={styles.modalImage}
            />
            {photos[selectedPhotoIndex].caption && (
              <p style={styles.modalCaption}>{photos[selectedPhotoIndex].caption}</p>
            )}
            <div style={styles.photoNav}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1));
                }}
                disabled={selectedPhotoIndex === 0}
                style={{
                  ...styles.navButton,
                  ...(selectedPhotoIndex === 0 ? styles.navButtonDisabled : {}),
                }}
              >
                ← Previous
              </button>
              <span style={styles.navText}>{selectedPhotoIndex + 1} / {photos.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex(Math.min(photos.length - 1, selectedPhotoIndex + 1));
                }}
                disabled={selectedPhotoIndex === photos.length - 1}
                style={{
                  ...styles.navButton,
                  ...(selectedPhotoIndex === photos.length - 1 ? styles.navButtonDisabled : {}),
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;