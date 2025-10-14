import React, { useState } from 'react';
import projectService from '../../services/projectService';
import { theme } from '../../theme';

const UpdatesSection = ({ projectId, updates, isContractor, onUpdateCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [updateType, setUpdateType] = useState('daily_summary');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.error || 'Failed to create update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setContent('');
    setPhotos([]);
    setShowForm(false);
    setError('');
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Daily Summaries & Weekly Plans</h2>
        {isContractor && !showForm && (
          <button onClick={() => setShowForm(true)} style={styles.createButton}>
            + New Update
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.updateForm}>
          <h3 style={styles.formTitle}>Create Update</h3>
          
          {error && <div style={styles.error}>{error}</div>}

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
                placeholder="Describe the progress, work done, or plans..."
                rows={6}
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
                  {update.photos.map((photo) => (
                    <div key={photo.id} style={styles.updatePhotoCard}>
                      <img src={photo.photo_url} alt={photo.caption || 'Update photo'} style={styles.updatePhoto} />
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
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  updateForm: {
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
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    marginTop: '0.5rem',
    backgroundColor: theme.colors.white,
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    marginTop: '0.5rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  fileInput: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  photosPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  photoPreview: {
    position: 'relative',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    padding: '0.5rem',
  },
  previewImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: theme.borderRadius.sm,
    marginBottom: '0.5rem',
  },
  captionInput: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.75rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
  },
  removeButton: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    backgroundColor: '#EF4444',
    color: theme.colors.white,
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '0.875rem',
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
  readOnlyNotice: {
    backgroundColor: '#EFF6FF',
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
  },
  noticeText: {
    margin: 0,
    color: '#1E40AF',
    fontSize: '0.875rem',
  },
  updatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  updateCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: '1.5rem',
  },
  updateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  updateType: {
    padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.sm,
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  updateDate: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  creatorName: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    marginBottom: '1rem',
  },
  updateContent: {
    fontSize: '1rem',
    color: theme.colors.text,
    lineHeight: '1.6',
    marginBottom: '1rem',
    whiteSpace: 'pre-wrap',
  },
  updatePhotos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  updatePhotoCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  updatePhoto: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  photoCaption: {
    padding: '0.5rem',
    fontSize: '0.875rem',
    color: theme.colors.text,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
};

export default UpdatesSection;