import React, { useState } from 'react';
import projectService from '../../services/projectService';
import ImageViewer from '../common/ImageViewer';
import { theme } from '../../theme';

const UpdatesSection = ({ projectId, updates, isContractor, onUpdateCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [updateType, setUpdateType] = useState('daily_summary');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 10) {
      setError('Maximum 10 photos per update');
      return;
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }));

    setPhotos([...photos, ...newPhotos]);
    setError('');
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handlePhotoCaption = (index, caption) => {
    const newPhotos = [...photos];
    newPhotos[index].caption = caption;
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter update content');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await projectService.createProjectUpdate(projectId, {
        update_type: updateType,
        content: content.trim(),
        photos,
      });

      setContent('');
      setPhotos([]);
      setShowForm(false);
      onUpdateCreated();
    } catch (err) {
      setError(err.message || 'Failed to create update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setContent('');
    setError('');
    setShowForm(false);
  };

  const openImageViewer = (updatePhotos, index) => {
    const images = updatePhotos.map((photo) => ({
      url: photo.photo_url,
      caption: photo.caption,
      filename: `update-photo-${photo.id}.jpg`,
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

  const handleDownloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `managrr-update-${Date.now()}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Project Updates</h2>
        {isContractor && !showForm && (
          <button onClick={() => setShowForm(true)} style={styles.createButton}>
            + Create Update
          </button>
        )}
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Update</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Update Type
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                style={styles.select}
              >
                <option value="daily_summary">Daily Summary</option>
                <option value="weekly_plan">Weekly Plan</option>
              </select>
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the work completed, progress made, or plans for the week..."
                rows={5}
                style={styles.textarea}
              />
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Photos (optional, max 10)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                style={styles.fileInput}
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div style={styles.photosPreview}>
              {photos.map((photo, index) => (
                <div key={index} style={styles.photoPreview}>
                  <img src={photo.preview} alt={`Preview ${index + 1}`} style={styles.previewImage} />
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handlePhotoCaption(index, e.target.value)}
                    placeholder="Photo caption..."
                    style={styles.captionInput}
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.formActions}>
            <button
              onClick={handleCancel}
              style={styles.cancelButton}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Update'}
            </button>
          </div>
        </div>
      )}

      {!isContractor && (
        <div style={styles.readOnlyNotice}>
          <p style={styles.noticeText}>
            📖 You can view updates but only the contractor can create new ones
          </p>
        </div>
      )}

      {updates && updates.length > 0 ? (
        <div style={styles.updatesList}>
          {updates.map((update) => (
            <div key={update.id} style={styles.updateCard}>
              <div style={styles.updateHeader}>
                <span style={{
                  ...styles.updateType,
                  backgroundColor: update.update_type === 'daily_summary' 
                    ? '#DBEAFE' 
                    : '#FEF3C7',
                  color: update.update_type === 'daily_summary' 
                    ? '#1E40AF' 
                    : '#92400E',
                }}>
                  {update.update_type === 'daily_summary' ? '📅 Daily Summary' : '📋 Weekly Plan'}
                </span>
                <span style={styles.updateDate}>
                  {new Date(update.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p style={styles.creatorName}>By {update.creator_name}</p>
              <p style={styles.updateContent}>{update.content}</p>
              
              {update.photos && update.photos.length > 0 && (
                <div style={styles.updatePhotos}>
                  {update.photos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      style={styles.updatePhotoCard}
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
                        alt={photo.caption || 'Update photo'} 
                        style={styles.updatePhoto}
                        onClick={() => openImageViewer(update.photos, index)}
                      />
                      <div style={styles.imageOverlay} data-overlay>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(update.photos, index);
                          }}
                          style={styles.overlayButton}
                          title="View full size"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(photo.photo_url, `update-photo-${photo.id}.jpg`);
                          }}
                          style={styles.overlayButton}
                          title="Download image"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      </div>
                      {photo.caption && (
                        <p style={styles.photoCaption}>{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No updates yet</p>
          {isContractor && (
            <p style={styles.emptyHint}>Create your first update to keep the owner informed!</p>
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
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    margin: 0,
  },
  createButton: {
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
  errorMessage: {
    padding: '1rem',
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
    fontSize: theme.typography.body.fontSize,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    marginBottom: '2rem',
    border: `1px solid ${theme.colors.borderLight}`,
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    marginBottom: '1.5rem',
    margin: 0,
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
  select: {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white,
    marginTop: '0.5rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    resize: 'vertical',
    marginTop: '0.5rem',
    boxSizing: 'border-box',
  },
  fileInput: {
    marginTop: '0.5rem',
    fontSize: theme.typography.body.fontSize,
  },
  photosPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  photoPreview: {
    position: 'relative',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  captionInput: {
    width: '100%',
    padding: '0.5rem',
    border: 'none',
    borderTop: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.small.fontSize,
    fontFamily: theme.typography.fontFamily,
    boxSizing: 'border-box',
  },
  removeButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '28px',
    height: '28px',
    backgroundColor: theme.colors.error,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  readOnlyNotice: {
    backgroundColor: theme.colors.infoLight,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '2rem',
    border: `1px solid ${theme.colors.info}`,
  },
  noticeText: {
    margin: 0,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.info,
  },
  updatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  updateCard: {
    backgroundColor: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  updateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  updateType: {
    padding: '0.375rem 0.875rem',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
  updateDate: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  creatorName: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    marginBottom: '0.5rem',
  },
  updateContent: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  updatePhotos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  updatePhotoCard: {
    position: 'relative',
    border: `2px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  updatePhoto: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  overlayButton: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: theme.colors.text,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  photoCaption: {
    padding: '0.75rem',
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.backgroundLight,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `2px dashed ${theme.colors.border}`,
  },
  emptyText: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textMuted,
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    margin: 0,
  },
};

export default UpdatesSection;