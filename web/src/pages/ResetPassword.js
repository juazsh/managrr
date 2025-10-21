"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import api from "../services/api"
import { theme } from "../theme"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (!tokenFromUrl) {
      setError("Invalid or missing reset token")
    } else {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!token) {
      setError("Invalid reset token")
      return
    }

    setIsLoading(true)

    try {
      await api.post("/auth/reset-password", {
        token: token,
        new_password: formData.newPassword,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.titleSuccess}>Password Reset Successful!</h2>
          <p style={styles.message}>
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <p style={styles.messageSmall}>
            Redirecting to login page...
          </p>
          <Link to="/login" style={styles.backButton}>
            Go to Login Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reset your password</h2>
          <p style={styles.subtitle}>
            Enter your new password below
          </p>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password (min. 8 characters)"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              style={styles.input}
              disabled={isLoading || !token}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              style={styles.input}
              disabled={isLoading || !token}
            />
          </div>
          <button 
            type="submit" 
            style={{...styles.button, ...((isLoading || !token) && styles.buttonDisabled)}} 
            disabled={isLoading || !token}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword