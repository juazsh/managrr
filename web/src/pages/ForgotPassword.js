"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { theme } from "../theme"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await api.post("/auth/forgot-password", { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.titleSuccess}>Check your email</h2>
          <p style={styles.message}>
            If the email exists in our system, a password reset link has been sent to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p style={styles.messageSmall}>
            The link will expire in 1 hour. If you don't see the email, check your spam folder.
          </p>
          <Link to="/login" style={styles.backButton}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Forgot your password?</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            style={{...styles.button, ...(isLoading && styles.buttonDisabled)}} 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p style={styles.linkText}>
          Remember your password?{" "}
          <Link to="/login" style={styles.link}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily,
    padding: "1rem",
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: "2.5rem",
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
    width: "100%",
    maxWidth: "440px",
    border: `1px solid ${theme.colors.borderLight}`,
  },
  header: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: "1.875rem",
    fontWeight: theme.typography.h3.fontWeight,
    marginBottom: "0.5rem",
    letterSpacing: "-0.02em",
  },
  titleSuccess: {
    color: theme.colors.success,
    fontSize: "1.875rem",
    fontWeight: theme.typography.h3.fontWeight,
    marginBottom: "1rem",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
  },
  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: theme.colors.successLight,
    color: theme.colors.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "0 auto 1.5rem",
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    textAlign: "center",
    marginBottom: "1rem",
    lineHeight: "1.6",
  },
  messageSmall: {
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
    textAlign: "center",
    marginBottom: "1.5rem",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "0.5rem",
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  input: {
    padding: "0.875rem 1rem",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
    transition: "all 0.2s ease",
  },
  button: {
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    padding: "0.875rem",
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textLight,
    cursor: "not-allowed",
    opacity: 0.6,
  },
  backButton: {
    display: "block",
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    padding: "0.875rem",
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: "0.875rem",
    borderRadius: theme.borderRadius.md,
    marginBottom: "1rem",
    fontSize: theme.typography.small.fontSize,
    border: `1px solid ${theme.colors.error}`,
  },
  linkText: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
  },
  link: {
    color: theme.colors.text,
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s ease",
  },
}

export default ForgotPassword