import { useState } from 'react';
import projectService from '../../services/projectService';
import ImageViewer from '../common/ImageViewer';

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
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-text m-0">Progress Photos</h2>
        {canUpload && !showUploadForm && (
          <button onClick={() => setShowUploadForm(true)} className="px-6 py-3 bg-primary text-white border-0 rounded-md text-[0.9375rem] font-semibold cursor-pointer transition-all duration-200 shadow-sm">
            + Upload Photo
          </button>
        )}
      </div>

      {showUploadForm && (
        <div className="bg-white p-8 rounded-lg border border-border-light mb-8 shadow-sm">
          <h3 className="text-xl font-semibold text-text m-0 mb-6">Upload New Photo</h3>

          {error && <div className="bg-error-light text-error p-4 rounded-md mb-4 border border-error text-base">{error}</div>}

          <div className="mb-6">
            <label className="block text-base font-semibold text-text mb-2">
              Select Photo
              <input type="file" accept="image/*" onChange={handleFileSelect} className="block w-full p-3 border-2 border-border rounded-md text-base cursor-pointer transition-colors duration-200" />
            </label>
          </div>

          {previewUrl && (
            <div className="mb-6">
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] rounded-md border-2 border-border-light" />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-base font-semibold text-text mb-2">
              Caption (optional)
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a description..."
                className="w-full p-3 border border-border rounded-md text-base transition-colors duration-200"
              />
            </label>
          </div>

          <div className="flex gap-4 justify-end">
            <button onClick={handleCancel} className="px-6 py-3 bg-transparent text-text-light border-2 border-border rounded-md text-base font-semibold cursor-pointer transition-all duration-200" disabled={uploading}>
              Cancel
            </button>
            <button onClick={handleUpload} className="px-6 py-3 bg-primary text-white border-0 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm" disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="bg-white rounded-lg overflow-hidden border border-border-light shadow-sm transition-all duration-200">
              <div
                className="relative pb-[75%] overflow-hidden bg-background-light"
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
                  className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer transition-transform duration-200"
                  onClick={() => openImageViewer(index)}
                />
                <div data-overlay className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageViewer(index);
                    }}
                    className="p-2 bg-black/70 text-white border-0 rounded-md cursor-pointer flex items-center justify-center transition-colors duration-200"
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
              {photo.caption && <p className="p-3 text-base text-text m-0 border-t border-border-light">{photo.caption}</p>}
              <p className="py-2 px-3 text-sm text-text-light m-0 border-t border-border-light">
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
        <div className="text-center py-16 px-4 bg-background-light rounded-lg border-2 border-dashed border-border">
          <div className="text-6xl mb-4 opacity-50">📷</div>
          <p className="text-lg text-text-light m-0 mb-6">No photos uploaded yet</p>
          {canUpload && !showUploadForm && (
            <button onClick={() => setShowUploadForm(true)} className="px-6 py-3 bg-primary text-white border-0 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm">
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

export default PhotosSection;
