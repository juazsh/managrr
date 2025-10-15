"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { theme } from "../theme"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else if (user.user_type === "house_owner") {
        navigate("/dashboard")
      } else if (user.user_type === "employee") {
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
    try {
      const response = await login(formData.email, formData.password)
      const loggedInUser = response.user

      if (loggedInUser.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else if (loggedInUser.user_type === "house_owner") {
        navigate("/dashboard")
      } else if (loggedInUser.user_type === "employee") {
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your Managrr account</p>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
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
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>
        <p style={styles.linkText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create account
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

export default Login
