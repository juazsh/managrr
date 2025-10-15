"use client"

import { useState } from "react"
import { theme } from "../theme"

const AssignContractorModal = ({ onAssign, onClose }) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email.trim()) {
      setError("Please enter contractor email")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)
      await onAssign(email)
      setSuccess("Contractor assigned successfully!")
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    content: {
      background: theme.colors.white,
      padding: "2rem",
      borderRadius: theme.borderRadius.lg,
      width: "100%",
      maxWidth: "500px",
      boxShadow: theme.shadows.xl,
    },
    title: {
      margin: "0 0 1.5rem 0",
      color: theme.colors.text,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      letterSpacing: "-0.01em",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: theme.typography.body.fontSize,
    },
    input: {
      width: "100%",
      padding: "0.875rem",
      border: `2px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    error: {
      backgroundColor: theme.colors.errorLight,
      color: theme.colors.error,
      padding: "0.875rem",
      borderRadius: theme.borderRadius.md,
      marginBottom: "1rem",
      fontSize: theme.typography.body.fontSize,
      border: `1px solid ${theme.colors.error}`,
      fontWeight: "500",
    },
    success: {
      backgroundColor: theme.colors.successLight,
      color: theme.colors.success,
      padding: "0.875rem",
      borderRadius: theme.borderRadius.md,
      marginBottom: "1rem",
      fontSize: theme.typography.body.fontSize,
      border: `1px solid ${theme.colors.success}`,
      fontWeight: "500",
    },
    actions: {
      display: "flex",
      gap: "0.75rem",
      justifyContent: "flex-end",
      flexWrap: "wrap",
    },
    cancelButton: {
      padding: "0.875rem 1.75rem",
      border: `2px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      cursor: "pointer",
      fontSize: theme.typography.body.fontSize,
      backgroundColor: theme.colors.white,
      color: theme.colors.text,
      fontWeight: "600",
      transition: "all 0.2s ease",
    },
    submitButton: {
      padding: "0.875rem 1.75rem",
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      borderRadius: theme.borderRadius.md,
      cursor: "pointer",
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: theme.shadows.sm,
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Assign Contractor</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Contractor Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contractor@example.com"
              disabled={loading}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignContractorModal
