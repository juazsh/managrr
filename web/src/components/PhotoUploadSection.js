"use client"

import { useState } from "react"
import projectService from "../services/projectService"

const PhotoUploadSection = ({ projectId, photos, onPhotoUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed")
      return
    }

    setError("")
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a photo")
      return
    }

    try {
      setUploading(true)
      setError("")
      const photo = await projectService.uploadProjectPhoto(projectId, selectedFile, caption)
      onPhotoUploaded(photo)
      setSelectedFile(null)
      setCaption("")
      document.getElementById("photo-input").value = ""
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload photo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-border-light">
      <h2 className="m-0 mb-6 text-text text-2xl font-bold tracking-tight">Project Photos</h2>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="file"
            id="photo-input"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            disabled={uploading}
            className="absolute opacity-0 w-0 h-0"
          />
          <label htmlFor="photo-input" className="block py-3.5 px-4 bg-background-light text-text rounded-md cursor-pointer text-base font-semibold text-center transition-all duration-200 border border-border whitespace-nowrap overflow-hidden text-ellipsis">
            {selectedFile ? selectedFile.name : "Choose Photo"}
          </label>
        </div>

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
          className="flex-1 min-w-[200px] py-3.5 px-4 border border-border rounded-md text-base bg-white transition-all duration-200"
        />

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`py-3.5 px-6 border-none rounded-md text-base font-semibold transition-all duration-200 flex-none whitespace-nowrap ${
            !selectedFile || uploading
              ? "bg-background-light text-text-muted cursor-not-allowed"
              : "bg-black text-white cursor-pointer"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <div className="bg-error-light text-error py-3.5 px-4 rounded-md mb-4 text-sm border border-error">{error}</div>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 mt-6">
        {photos.length === 0 ? (
          <p className="text-center text-text-muted py-12 px-4 text-base">No photos uploaded yet</p>
        ) : (
          photos.map((photo, index) => (
            <div key={photo.id} className="border border-border rounded-md overflow-hidden cursor-pointer transition-all duration-300 bg-white" onClick={() => setSelectedPhotoIndex(index)}>
              <img
                src={photo.photo_url || "/placeholder.svg"}
                alt={photo.caption || "Project photo"}
                className="w-full h-[200px] object-cover block"
              />
              {photo.caption && <p className="p-3 text-sm text-text leading-6">{photo.caption}</p>}
              <p className="px-3 pb-3 text-xs text-text-muted">{new Date(photo.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      {selectedPhotoIndex !== null && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90 flex justify-center items-center z-[1000] p-8" onClick={() => setSelectedPhotoIndex(null)}>
          <div className="relative max-w-[90%] max-h-[90%] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button className="absolute -top-10 right-0 bg-transparent border-none text-white text-[40px] cursor-pointer leading-none p-0 transition-opacity duration-200" onClick={() => setSelectedPhotoIndex(null)}>
              ×
            </button>
            <img
              src={photos[selectedPhotoIndex].photo_url || "/placeholder.svg"}
              alt={photos[selectedPhotoIndex].caption || "Project photo"}
              className="max-w-full max-h-[70vh] object-contain rounded-md"
            />
            {photos[selectedPhotoIndex].caption && (
              <p className="text-white mt-4 text-base text-center max-w-[600px]">{photos[selectedPhotoIndex].caption}</p>
            )}
            <div className="flex gap-6 items-center mt-6 flex-wrap justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1))
                }}
                disabled={selectedPhotoIndex === 0}
                className={`py-2.5 px-5 bg-white text-text border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 ${
                  selectedPhotoIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ← Previous
              </button>
              <span className="text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPhotoIndex(Math.min(photos.length - 1, selectedPhotoIndex + 1))
                }}
                disabled={selectedPhotoIndex === photos.length - 1}
                className={`py-2.5 px-5 bg-white text-text border-none rounded-md cursor-pointer text-sm font-semibold transition-all duration-200 ${
                  selectedPhotoIndex === photos.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoUploadSection
