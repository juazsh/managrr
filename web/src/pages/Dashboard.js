"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import projectService from "../services/projectService"
import { useAuth } from "../context/AuthContext"

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
            <span className="text-xl leading-none">+</span>
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
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <rect x="8" y="8" width="48" height="48" rx="4" />
              <path d="M8 20h48M20 8v48" />
            </svg>
          </div>
          <h2 className="empty-title">No projects yet</h2>
          <p className="empty-text">Create your first project to start managing your construction work</p>
          {user?.user_type === "house_owner" && (
            <Link to="/projects/new" className="dashboard-create-btn w-auto">
              <span className="text-xl leading-none">+</span>
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
              {project.contractor_name && (
                <p className="project-contractor">
                  <span className="opacity-70">👷 Contractor:</span> {project.contractor_name}
                </p>
              )}
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

export default Dashboard
