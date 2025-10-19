"use client"

import { useState, useEffect } from "react"
import { theme } from "../../theme"

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
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>
          <div style={styles.actions}>
            <button onClick={handleDownload} style={styles.actionButton} title="Download image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span style={styles.buttonText}>Download</span>
            </button>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              style={styles.actionButton}
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
              <span style={styles.buttonText}>{isZoomed ? "Zoom Out" : "Zoom In"}</span>
            </button>
            <button onClick={onClose} style={styles.closeButton} title="Close (Esc)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={styles.imageContainer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {currentIndex > 0 && (
            <button onClick={handlePrevious} style={{ ...styles.navButton, ...styles.prevButton }} title="Previous (←)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div style={styles.imageWrapper}>
            <img
              src={currentImage.url || "/placeholder.svg"}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              style={{
                ...styles.image,
                ...(isZoomed ? styles.imageZoomed : {}),
              }}
            />
          </div>

          {currentIndex < images.length - 1 && (
            <button onClick={handleNext} style={{ ...styles.navButton, ...styles.nextButton }} title="Next (→)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div style={styles.thumbnailStrip}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                style={{
                  ...styles.thumbnail,
                  ...(index === currentIndex ? styles.thumbnailActive : {}),
                }}
                title={`Go to image ${index + 1}`}
              >
                <img src={img.url || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} style={styles.thumbnailImage} />
              </button>
            ))}
          </div>
        )}

        {currentImage.caption && <div style={styles.caption}>{currentImage.caption}</div>}
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

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  container: {
    width: "100%",
    maxWidth: "1400px",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    padding: "0 0.5rem",
    zIndex: 10001,
  },
  imageCounter: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: theme.colors.text,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily,
  },
  buttonText: {
    className: "button-text",
  },
  closeButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: theme.colors.text,
    border: "none",
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "1.5rem",
    fontWeight: "300",
  },
  imageContainer: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 0,
  },
  imageWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
    padding: "1rem",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: theme.borderRadius.lg,
    transition: "transform 0.3s ease",
  },
  imageZoomed: {
    maxWidth: "none",
    maxHeight: "none",
    width: "150%",
    cursor: "move",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "56px",
    height: "56px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: theme.colors.text,
    border: "none",
    borderRadius: theme.borderRadius.full,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 10001,
    fontSize: "1.5rem",
  },
  prevButton: {
    left: "1rem",
  },
  nextButton: {
    right: "1rem",
  },
  thumbnailStrip: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem 0.5rem",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    justifyContent: "center",
    zIndex: 10001,
  },
  thumbnail: {
    width: "80px",
    height: "60px",
    padding: 0,
    border: "3px solid transparent",
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  thumbnailActive: {
    border: `3px solid ${theme.colors.primary}`,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  caption: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    lineHeight: "1.6",
    textAlign: "center",
    zIndex: 10001,
  },
}

export default ImageViewer
