"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import projectService from "../services/projectService"
import EditProjectForm from "../components/EditProjectForm"
import PhotoUploadSection from "../components/PhotoUploadSection"
import AssignContractorModal from "../components/AssignContractorModal"
import { theme } from "../theme"

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [contractors, setContractors] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  useEffect(() => {
    fetchProjectDetails()
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      const [projectData, photoData, contractorsData] = await Promise.all([
        projectService.getProjectById(id),
        projectService.getProjectPhotos(id),
        projectService.getProjectContractors(id)
      ])
      setProject(projectData.project)
      setPhotos(photoData.photos || [])
      setContractors(contractorsData || [])
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async (updatedProject) => {
    setProject(updatedProject)
    setIsEditing(false)
    await fetchProjectDetails()
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.deleteProject(id)
        navigate("/projects")
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete project")
      }
    }
  }

  const handleAssignContractor = async (contractorIds) => {
    try {
      console.log("assigning contractors", contractorIds)
      await projectService.assignContractor(id, contractorIds)
      await fetchProjectDetails()
      setShowAssignModal(false)
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to assign contractors")
    }
  }

  const handleRemoveContractor = async (contractorId) => {
    if (window.confirm("Remove this contractor from the project?")) {
      try {
        await projectService.removeContractor(id, contractorId)
        await fetchProjectDetails()
      } catch (err) {
        setError(err.response?.data?.error || "Failed to remove contractor")
      }
    }
  }

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([...photos, newPhoto])
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "draft":
        return { backgroundColor: "#FEF3C7", color: "#92400E" }
      case "active":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF" }
      case "completed":
        return { backgroundColor: "#D1FAE5", color: "#065F46" }
      default:
        return {}
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading project...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  if (!project) {
    return <div style={styles.error}>Project not found</div>
  }

  return (
    <div style={styles.container}>
      <div style={headerActionStyles.container}>
        <button onClick={() => navigate("/projects")} style={styles.backButton}>
          ← Back to Projects
        </button>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to={`/projects/${id}/dashboard`} style={headerActionStyles.dashboardLink}>
            📊 View Dashboard
          </Link>
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                ✏️ Edit
              </button>
              <button onClick={handleDelete} style={styles.deleteButton}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <EditProjectForm project={project} onSave={handleUpdateProject} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <div style={styles.infoCard}>
            <h1 style={styles.title}>{project.title}</h1>
            <div style={styles.meta}>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(project.status) }}>{project.status}</span>
              <span style={styles.cost}>Estimated Cost: ${Number(project.estimated_cost).toLocaleString()}</span>
            </div>
            <p style={styles.description}>{project.description}</p>
            <p style={styles.address}>
              <strong>Address:</strong> {project.address}
            </p>
          </div>

          <div style={styles.contractorSection}>
            <div style={styles.contractorHeader}>
              <h2 style={styles.sectionTitle}>Assigned Contractors</h2>
              <button onClick={() => setShowAssignModal(true)} style={styles.assignButton}>
                + Add Contractor
              </button>
            </div>
            {contractors.length === 0 ? (
              <p style={styles.noContractors}>No contractors assigned yet</p>
            ) : (
              <div style={styles.contractorList}>
                {contractors.map((contractor) => (
                  <div key={contractor.contractor_id} style={styles.contractorItem}>
                    <div style={styles.contractorInfo}>
                      <div style={styles.contractorName}>{contractor.name}</div>
                      <div style={styles.contractorEmail}>{contractor.email}</div>
                      <div style={styles.contractorDate}>
                        Assigned: {new Date(contractor.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveContractor(contractor.contractor_id)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PhotoUploadSection projectId={id} photos={photos} onPhotoUploaded={handlePhotoUploaded} />
        </>
      )}

      {showAssignModal && (
        <AssignContractorModal
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignContractor}
          currentContractors={contractors}
        /> 
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: theme.colors.textLight,
  },
  error: {
    padding: "1rem",
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    borderRadius: theme.borderRadius.md,
    margin: "2rem auto",
    maxWidth: "600px",
  },
  backButton: {
    padding: "0.75rem 1.25rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  editButton: {
    padding: "0.75rem 1.25rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    border: "none",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  deleteButton: {
    padding: "0.75rem 1.25rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    border: "none",
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#DC2626",
    color: theme.colors.white,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    padding: "2rem",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    marginTop: "2rem",
  },
  title: {
    margin: "0 0 1rem 0",
    color: theme.colors.text,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
  },
  meta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
  },
  cost: {
    padding: "0.5rem 1rem",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
  },
  description: {
    color: theme.colors.textLight,
    lineHeight: "1.6",
    marginBottom: "1rem",
  },
  address: {
    color: theme.colors.text,
  },
  contractorSection: {
    backgroundColor: theme.colors.white,
    padding: "2rem",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    marginTop: "2rem",
  },
  contractorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    margin: 0,
    color: theme.colors.text,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
  },
  assignButton: {
    padding: "0.75rem 1.25rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    border: "none",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  noContractors: {
    padding: "2rem",
    textAlign: "center",
    color: theme.colors.textLight,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
  },
  contractorList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  contractorItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  contractorInfo: {
    flex: 1,
  },
  contractorName: {
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.25rem",
  },
  contractorEmail: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    marginBottom: "0.25rem",
  },
  contractorDate: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  removeButton: {
    padding: "0.5rem 1rem",
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
    border: "none",
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
}

const headerActionStyles = {
  container: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    textDecoration: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
    border: "none",
    cursor: "pointer",
  },
}

export default ProjectDetail