"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { theme } from "../theme"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "house_owner",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else {
        navigate("/dashboard")
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await register(formData.name, formData.email, formData.password, formData.userType)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Registration Successful!</h2>
          <p style={styles.successMessage}>
            Please check your email to verify your account. You'll be redirected to login shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create an account</h2>
          <p style={styles.subtitle}>Get started with Managrr</p>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password (min. 8 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>I am a</label>
            <select 
              name="userType" 
              value={formData.userType} 
              onChange={handleChange} 
              style={styles.select} 
              required
              disabled={isLoading}
            >
              <option value="house_owner">House Owner</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>
          <button type="submit" style={{...styles.button, ...(isLoading && styles.buttonDisabled)}} disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
        <p style={styles.linkText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
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
  subtitle: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
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
  select: {
    padding: "0.875rem 1rem",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
    cursor: "pointer",
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
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 1.5rem",
  },
  successMessage: {
    color: theme.colors.textLight,
    textAlign: "center",
    fontSize: theme.typography.body.fontSize,
    marginTop: "1rem",
  },
}

export default Register