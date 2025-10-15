"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { theme } from "../theme"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.message}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2 style={styles.errorTitle}>Access Denied</h2>
          <p style={styles.errorMessage}>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "3rem 2rem",
    textAlign: "center",
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: `4px solid ${theme.colors.backgroundLight}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  message: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textLight,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: "2rem",
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.error}`,
    maxWidth: "500px",
  },
  errorTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    marginBottom: "0.5rem",
  },
  errorMessage: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: "1.6",
  },
}

export default ProtectedRoute
