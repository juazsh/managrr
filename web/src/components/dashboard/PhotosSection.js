import { useState } from 'react';
import projectService from '../../services/projectService';
import ImageViewer from '../common/ImageViewer';
import { theme } from '../../theme';

const PhotosSection = ({ projectId, photos, canUpload, onPhotoUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl(null);
    setShowUploadForm(false);
    setError('');
  };

  const openImageViewer = (index) => {
    const images = photos.map((photo) => ({
      url: photo.photo_url,
      caption: photo.caption || '',
      filename: `progress-photo-${photo.id}.jpg`,
    }));

    setImageViewerState({
      isOpen: true,
      images,
      initialIndex: index,
    });
  };

  const closeImageViewer = () => {
    setImageViewerState({
      isOpen: false,
      images: [],
      initialIndex: 0,
    });
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
              <input type="file" accept="image/*" onChange={handleFileSelect} style={styles.fileInput} />
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
            <button onClick={handleCancel} style={styles.cancelButton} disabled={uploading}>
              Cancel
            </button>
            <button onClick={handleUpload} style={styles.submitButton} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {photos && photos.length > 0 ? (
        <div style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={styles.photoCard}>
              <div 
                style={styles.photoWrapper}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Project photo'}
                  style={styles.photo}
                  onClick={() => openImageViewer(index)}
                />
                <div style={styles.overlayButtons} data-overlay>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageViewer(index);
                    }}
                    style={styles.overlayButton}
                    title="View image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                </div>
              </div>
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
          <div style={styles.emptyIcon}>📷</div>
          <p style={styles.emptyText}>No photos uploaded yet</p>
          {canUpload && !showUploadForm && (
            <button onClick={() => setShowUploadForm(true)} style={styles.emptyButton}>
              Upload First Photo
            </button>
          )}
        </div>
      )}

      {imageViewerState.isOpen && (
        <ImageViewer
          images={imageViewerState.images}
          initialIndex={imageViewerState.initialIndex}
          onClose={closeImageViewer}
        />
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
    flexWrap: 'wrap',
    gap: '1rem',
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
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  },
  uploadForm: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.component,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    marginBottom: theme.spacing.component,
    boxShadow: theme.shadows.sm,
  },
  formTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    margin: '0 0 1.5rem 0',
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: theme.spacing.element,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.element,
    border: `1px solid ${theme.colors.error}`,
    fontSize: theme.typography.body.fontSize,
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.5rem',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  preview: {
    marginBottom: '1.5rem',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.borderLight}`,
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    transition: 'border-color 0.2s ease',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: theme.colors.textLight,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  },
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: theme.spacing.element,
  },
  photoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: theme.shadows.sm,
    transition: 'all 0.2s ease',
  },
  photoWrapper: {
    position: 'relative',
    paddingBottom: '75%',
    overflow: 'hidden',
    backgroundColor: theme.colors.backgroundLight,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  overlayButtons: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    gap: '0.5rem',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  overlayButton: {
    padding: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },
  photoCaption: {
    padding: '0.75rem',
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    margin: 0,
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  photoDate: {
    padding: '0.5rem 0.75rem',
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    margin: 0,
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 1rem',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    border: `2px dashed ${theme.colors.border}`,
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textLight,
    margin: '0 0 1.5rem 0',
  },
  emptyButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  },
};

export default PhotosSection;