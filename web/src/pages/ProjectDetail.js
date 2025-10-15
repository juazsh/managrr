"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import projectService from "../services/projectService"
import AssignContractorModal from "../components/AssignContractorModal"
import EditProjectForm from "../components/EditProjectForm"
import PhotoUploadSection from "../components/PhotoUploadSection"
import { projectDetailStyles as styles } from "./ProjectDetailStyles"
import { theme } from "../theme"

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadProjectDetails()
  }, [id])

  const loadProjectDetails = async () => {
    try {
      setLoading(true)
      const [projectData, photosData] = await Promise.all([
        projectService.getProjectById(id),
        projectService.getProjectPhotos(id),
      ])
      setProject(projectData.project)
      setPhotos(photosData.photos || [])
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have permission to view this project.")
      } else if (err.response?.status === 404) {
        setError("Project not found.")
      } else {
        setError("Failed to load project details")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAssignContractor = async (contractorEmail) => {
    try {
      await projectService.assignContractor(id, contractorEmail)
      await loadProjectDetails()
      setShowAssignModal(false)
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to assign contractor")
    }
  }

  const handleUpdateProject = async (projectData) => {
    try {
      const updatedProject = await projectService.updateProject(id, projectData)
      setProject(updatedProject)
      setIsEditing(false)
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to update project")
    }
  }

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([newPhoto, ...photos])
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "draft":
        return styles.statusDraft
      case "active":
        return styles.statusActive
      case "completed":
        return styles.statusCompleted
      default:
        return {}
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading project details...</div>
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")} style={styles.errorButton}>
          Back to Projects
        </button>
      </div>
    )
  }

  if (!project) {
    return <div style={styles.error}>Project not found</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Projects
        </button>
        <div style={headerActionStyles.container}>
          <Link to={`/projects/${id}/dashboard`} style={headerActionStyles.dashboardLink}>
            📊 View Dashboard
          </Link>
          <button onClick={() => setIsEditing(true)} style={styles.editButton}>
            Edit Project
          </button>
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
            <h2 style={styles.sectionTitle}>Contractor</h2>
            {project.contractor_id ? (
              <div>
                <p style={styles.contractorInfo}>
                  <strong>Name:</strong> {project.contractor_name}
                </p>
                <p style={styles.contractorInfo}>
                  <strong>Email:</strong> {project.contractor_email}
                </p>
              </div>
            ) : (
              <div style={styles.noContractor}>
                <p style={styles.noContractorText}>No contractor assigned yet</p>
                <button onClick={() => setShowAssignModal(true)} style={styles.assignButton}>
                  Assign Contractor
                </button>
              </div>
            )}
          </div>

          <PhotoUploadSection projectId={id} photos={photos} onPhotoUploaded={handlePhotoUploaded} />
        </>
      )}

      {showAssignModal && (
        <AssignContractorModal onClose={() => setShowAssignModal(false)} onAssign={handleAssignContractor} />
      )}
    </div>
  )
}

const headerActionStyles = {
  container: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  dashboardLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.875rem 1.5rem",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    textDecoration: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: "0.9375rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
}

export default ProjectDetail
