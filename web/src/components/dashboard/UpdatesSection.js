import React, { useState } from 'react';
import projectService from '../../services/projectService';
import ImageViewer from '../common/ImageViewer';

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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-text m-0">Project Updates</h2>
        {isContractor && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-primary text-white border-0 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm">
            + Create Update
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-error-light text-error rounded-md mb-4 text-base">{error}</div>}

      {showForm && (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 border border-border-light">
          <h3 className="text-xl font-semibold text-text mb-6 m-0">Create New Update</h3>

          <div className="mb-6">
            <label className="block text-base font-semibold text-text mb-2">
              Update Type
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                className="w-full p-3 border-2 border-border rounded-md text-base font-sans bg-white mt-2"
              >
                <option value="daily_summary">Daily Summary</option>
                <option value="weekly_plan">Weekly Plan</option>
              </select>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-base font-semibold text-text mb-2">
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the work completed, progress made, or plans for the week..."
                rows={5}
                className="w-full p-3 border-2 border-border rounded-md text-base font-sans resize-y mt-2 box-border"
              />
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-base font-semibold text-text mb-2">
              Photos (optional, max 10)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="mt-2 text-base"
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-6">
              {photos.map((photo, index) => (
                <div key={index} className="relative border-2 border-border rounded-md overflow-hidden">
                  <img src={photo.preview} alt={`Preview ${index + 1}`} className="w-full h-[150px] object-cover" />
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handlePhotoCaption(index, e.target.value)}
                    placeholder="Photo caption..."
                    className="w-full p-2 border-0 border-t border-border text-sm font-sans box-border"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-error text-white border-0 rounded-full cursor-pointer text-base flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-white text-text border-2 border-border rounded-md text-base font-semibold cursor-pointer transition-all duration-200"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-primary text-white border-0 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Update'}
            </button>
          </div>
        </div>
      )}

      {!isContractor && (
        <div className="bg-blue-50 p-4 rounded-md mb-8 border border-blue-900">
          <p className="m-0 text-base text-blue-900">
            📖 You can view updates but only the contractor can create new ones
          </p>
        </div>
      )}

      {updates && updates.length > 0 ? (
        <div className="flex flex-col gap-6">
          {updates.map((update) => (
            <div key={update.id} className="bg-white p-6 rounded-lg shadow-md border border-border-light">
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${
                    update.update_type === 'daily_summary'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {update.update_type === 'daily_summary' ? '📅 Daily Summary' : '📋 Weekly Plan'}
                </span>
                <span className="text-sm text-text-light">
                  {new Date(update.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-text-light mb-2">By {update.creator_name}</p>
              <p className="text-base text-text leading-relaxed mb-4">{update.content}</p>

              {update.photos && update.photos.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-4">
                  {update.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative border-2 border-border-light rounded-md overflow-hidden cursor-pointer transition-all duration-200"
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
                        className="w-full h-[200px] object-cover block"
                        onClick={() => openImageViewer(update.photos, index)}
                      />
                      <div data-overlay className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(update.photos, index);
                          }}
                          className="w-11 h-11 bg-white/90 text-text border-0 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200"
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
                          className="w-11 h-11 bg-white/90 text-text border-0 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200"
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
                        <p className="p-3 text-sm text-text bg-background-light m-0">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white rounded-lg border-2 border-dashed border-border">
          <p className="text-lg text-text-muted mb-2">No updates yet</p>
          {isContractor && (
            <p className="text-base text-text-light m-0">Create your first update to keep the owner informed!</p>
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

export default UpdatesSection;
