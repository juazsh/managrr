"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import projectService from "../services/projectService"
import { theme } from "../theme"

const ContractorDashboard = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

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
      draft: theme.colors.textLight,
      active: theme.colors.success,
      completed: theme.colors.primary,
    }
    return colors[status] || theme.colors.textLight
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Assigned Projects</h1>
        <div style={styles.headerActions}>
          <Link to="/contractor/employees" style={styles.manageButton}>
            <span style={styles.buttonIcon}>👥</span>
            <span>Manage Employees</span>
          </Link>
          <Link to="/contractor/work-logs" style={styles.workLogsLink}>
            Work Logs
          </Link>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <p style={styles.emptyText}>No projects assigned yet.</p>
          <p style={styles.emptySubtext}>You'll see your assigned projects here once they're available.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/dashboard`}
              style={styles.card}
              className="project-card"
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(project.status),
                  }}
                >
                  {project.status}
                </span>
              </div>

              {project.description && <p style={styles.description}>{project.description}</p>}

              <div style={styles.cardFooter}>
                {project.estimated_cost && (
                  <div style={styles.cost}>
                    <span style={styles.costLabel}>Budget:</span>
                    <span style={styles.costValue}>${project.estimated_cost.toLocaleString()}</span>
                  </div>
                )}

                {project.address && (
                  <div style={styles.address}>
                    <span style={styles.locationIcon}>📍</span>
                    {project.address}
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
    padding: theme.spacing.component,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 1rem",
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
    fontSize: theme.typography.bodyLarge.fontSize,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.section,
    gap: theme.spacing.element,
    flexWrap: "wrap",
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    margin: "0",
    letterSpacing: "-0.02em",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  manageButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
  },
  buttonIcon: {
    fontSize: "1.125rem",
  },
  workLogsLink: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: theme.colors.primary,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.2s ease",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: theme.spacing.element,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.component,
    border: `1px solid ${theme.colors.error}`,
    fontSize: theme.typography.body.fontSize,
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 1.25rem",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
    opacity: 0.5,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  emptySubtext: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
    gap: theme.spacing.component,
  },
  card: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.component,
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.element,
    transition: "all 0.2s ease",
    cursor: "pointer",
    boxShadow: theme.shadows.sm,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.75rem",
  },
  projectTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    margin: "0",
    flex: 1,
    lineHeight: "1.3",
  },
  statusBadge: {
    padding: "0.375rem 0.875rem",
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
    color: theme.colors.white,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    margin: "0",
    lineHeight: "1.6",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingTop: "0.5rem",
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  cost: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: theme.typography.bodyLarge.fontSize,
  },
  costLabel: {
    color: theme.colors.textLight,
    fontWeight: "500",
  },
  costValue: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  address: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  locationIcon: {
    fontSize: "0.875rem",
  },
}

export default ContractorDashboard
