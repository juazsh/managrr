"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import projectService from "../services/projectService"
import { useAuth } from "../context/AuthContext"
import { theme } from "../theme"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.user_type === "contractor") {
      navigate("/contractor/dashboard")
      return
    }
    fetchProjects()
  }, [user, navigate])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAllProjects()
      setProjects(data.projects || [])
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "#6B7280",
      active: "#10B981",
      completed: "#3B82F6",
    }
    return colors[status] || "#6B7280"
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Projects</h1>
          <p className="dashboard-subtitle">
            {projects.length === 0
              ? "Get started by creating your first project"
              : `Managing ${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
          </p>
        </div>
        {user?.user_type === "house_owner" && (
          <Link to="/projects/new" className="dashboard-create-btn">
            <span style={{ fontSize: "1.25rem", lineHeight: "1" }}>+</span>
            <span>Create Project</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="error-message">
          <svg className="error-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke={theme.colors.textMuted} strokeWidth="2">
              <rect x="8" y="8" width="48" height="48" rx="4" />
              <path d="M8 20h48M20 8v48" />
            </svg>
          </div>
          <h2 className="empty-title">No projects yet</h2>
          <p className="empty-text">Create your first project to start managing your construction work</p>
          {user?.user_type === "house_owner" && (
            <Link to="/projects/new" className="dashboard-create-btn" style={{ width: "auto" }}>
              <span style={{ fontSize: "1.25rem", lineHeight: "1" }}>+</span>
              Create Your First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="dashboard-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              <div className="project-card-header">
                <h3 className="project-title">{project.title}</h3>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(project.status),
                  }}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="project-description">
                  {project.description.length > 120
                    ? `${project.description.substring(0, 120)}...`
                    : project.description}
                </p>
              )}

              <div className="project-card-footer">
                {project.estimated_cost && (
                  <div className="project-meta-item">
                    <svg className="project-meta-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.5 1a.5.5 0 00-1 0v1H6a.5.5 0 000 1h1.5v1.5a.5.5 0 001 0V3H10a.5.5 0 000-1H8.5V1z" />
                      <path d="M3 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V2a2 2 0 00-2-2H3zm0 1h10a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" />
                    </svg>
                    <span className="project-cost">${project.estimated_cost.toLocaleString()}</span>
                  </div>
                )}
                {project.address && (
                  <div className="project-meta-item">
                    <svg className="project-meta-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 1a3 3 0 00-3 3c0 1.657 3 6 3 6s3-4.343 3-6a3 3 0 00-3-3zM8 6a2 2 0 110-4 2 2 0 010 4z"
                        clipRule="evenodd"
                      />
                      <path d="M8 8s-4 3-4 5a4 4 0 008 0c0-2-4-5-4-5z" />
                    </svg>
                    <span className="project-address">{project.address}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1rem",
    minHeight: "calc(100vh - 80px)",
    "@media (min-width: 768px)": {
      padding: "3rem 2rem",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2.5rem",
    gap: "1.5rem",
    flexDirection: "column",
    "@media (min-width: 768px)": {
      flexDirection: "row",
      alignItems: "center",
    },
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: theme.colors.text,
    margin: "0 0 0.5rem 0",
    lineHeight: "1.2",
    "@media (min-width: 768px)": {
      fontSize: "2.5rem",
    },
  },
  subtitle: {
    fontSize: "1rem",
    color: theme.colors.textLight,
    margin: 0,
  },
  createButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    textDecoration: "none",
    borderRadius: theme.borderRadius.lg,
    fontWeight: "600",
    fontSize: "0.938rem",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
    width: "100%",
    justifyContent: "center",
    "@media (min-width: 768px)": {
      width: "auto",
    },
  },
  buttonIcon: {
    fontSize: "1.25rem",
    lineHeight: "1",
  },
  buttonText: {
    display: "none",
    "@media (min-width: 400px)": {
      display: "inline",
    },
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "1rem",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: `4px solid ${theme.colors.borderLight}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: theme.colors.textLight,
    fontSize: "1rem",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: "1rem 1.25rem",
    borderRadius: theme.borderRadius.lg,
    marginBottom: "2rem",
    border: `1px solid ${theme.colors.error}`,
    fontSize: "0.938rem",
    lineHeight: "1.5",
  },
  errorIcon: {
    flexShrink: 0,
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 1.5rem",
    maxWidth: "500px",
    margin: "0 auto",
  },
  emptyIcon: {
    marginBottom: "1.5rem",
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.75rem",
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: "1rem",
    marginBottom: "2rem",
    lineHeight: "1.6",
  },
  emptyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 2rem",
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    textDecoration: "none",
    borderRadius: theme.borderRadius.lg,
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.md,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.25rem",
    "@media (min-width: 640px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  card: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.xl,
    padding: "1.5rem",
    textDecoration: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: theme.shadows.sm,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  projectTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: theme.colors.text,
    margin: 0,
    flex: 1,
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  statusBadge: {
    padding: "0.375rem 0.75rem",
    borderRadius: theme.borderRadius.full,
    fontSize: "0.75rem",
    fontWeight: "600",
    color: theme.colors.white,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  description: {
    fontSize: "0.938rem",
    color: theme.colors.textLight,
    lineHeight: "1.6",
    margin: 0,
  },
  cardFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingTop: "0.5rem",
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  metaIcon: {
    color: theme.colors.textMuted,
    flexShrink: 0,
  },
  cost: {
    fontSize: "1rem",
    fontWeight: "600",
    color: theme.colors.text,
  },
  address: {
    fontSize: "0.875rem",
    color: theme.colors.textLight,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}

if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (min-width: 640px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `
  document.head.appendChild(style)
}

export default Dashboard
