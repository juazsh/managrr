"use client"

import { useState, useEffect } from "react"

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const currentImage = images[currentIndex]

  const minSwipeDistance = 50

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [currentIndex])

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsZoomed(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsZoomed(false)
    }
  }

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index)
    setIsZoomed(false)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url, {
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = currentImage.filename || `managrr-image-${Date.now()}.jpg`
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download image. Please try again.")
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="w-full max-w-[1400px] max-h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2 z-[10001]">
          <div className="text-white text-base font-semibold">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 bg-white/90 text-text border-0 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-white" title="Download image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="button-text">Download</span>
            </button>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/90 text-text border-0 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-white"
              title={isZoomed ? "Zoom out" : "Zoom in"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isZoomed ? (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </>
                ) : (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </>
                )}
              </svg>
              <span className="button-text">{isZoomed ? "Zoom Out" : "Zoom In"}</span>
            </button>
            <button onClick={onClose} className="flex items-center justify-center w-11 h-11 bg-white/90 text-text border-0 rounded-md cursor-pointer transition-all duration-200 hover:bg-white" title="Close (Esc)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="flex-1 relative flex items-center justify-center min-h-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {currentIndex > 0 && (
            <button onClick={handlePrevious} className="absolute top-1/2 -translate-y-1/2 left-4 w-14 h-14 bg-white/90 text-text border-0 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 z-[10001] hover:bg-white" title="Previous (←)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <img
              src={currentImage.url || "/placeholder.svg"}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ${isZoomed ? "!max-w-none !max-h-none !w-[150%] cursor-move" : ""}`}
            />
          </div>

          {currentIndex < images.length - 1 && (
            <button onClick={handleNext} className="absolute top-1/2 -translate-y-1/2 right-4 w-14 h-14 bg-white/90 text-text border-0 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 z-[10001] hover:bg-white" title="Next (→)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 py-4 px-2 overflow-x-auto justify-center z-[10001]" style={{ WebkitOverflowScrolling: "touch" }}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-20 h-[60px] p-0 border-[3px] rounded-md cursor-pointer transition-all duration-200 flex-shrink-0 overflow-hidden bg-white/10 ${index === currentIndex ? "border-primary" : "border-transparent"}`}
                title={`Go to image ${index + 1}`}
              >
                <img src={img.url || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {currentImage.caption && <div className="mt-4 p-4 bg-white/10 text-white rounded-md text-base leading-relaxed text-center z-[10001]">{currentImage.caption}</div>}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .button-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ImageViewer
