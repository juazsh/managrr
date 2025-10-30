"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import projectService from "../services/projectService"

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
      draft: "#6B7280",
      active: "#10B981",
      completed: "#2563EB",
    }
    return colors[status] || "#6B7280"
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
          <div className="w-12 h-12 border-4 border-border-light border-t-primary rounded-full animate-spin"></div>
          <p className="text-text-light text-lg">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <h1 className="text-[2rem] font-bold text-text m-0 tracking-tight">My Assigned Projects</h1>
        <div className="flex gap-3 items-center flex-wrap">
          <Link to="/contractor/employees" className="flex items-center gap-2 py-3 px-6 bg-primary text-white border-none rounded-md text-base font-semibold cursor-pointer no-underline transition-all duration-200 shadow-sm">
            <span className="text-lg">👥</span>
            <span>Manage Employees</span>
          </Link>
          <Link to="/contractor/work-logs" className="py-3 px-6 bg-transparent text-primary border-2 border-primary rounded-md text-base font-semibold cursor-pointer no-underline inline-block transition-all duration-200">
            Work Logs
          </Link>
        </div>
      </div>

      {error && <div className="bg-error-light text-error p-4 rounded-md mb-8 border border-error text-base">{error}</div>}

      {projects.length === 0 ? (
        <div className="text-center py-16 px-5 bg-white rounded-lg border border-border-light">
          <div className="text-[4rem] mb-4 opacity-50">📋</div>
          <p className="text-text text-xl font-semibold mb-2">No projects assigned yet.</p>
          <p className="text-text-light text-base">You'll see your assigned projects here once they're available.</p>
        </div>
      ) : (
        <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/dashboard`}
              className="bg-white border border-border-light rounded-lg p-8 no-underline flex flex-col gap-4 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-semibold text-text m-0 flex-1 leading-snug">{project.title}</h3>
                <span
                  className="py-1.5 px-3.5 rounded-full text-sm font-semibold text-white capitalize whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status}
                </span>
              </div>

              {project.description && <p className="text-base text-text-light m-0 leading-relaxed overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" }}>{project.description}</p>}

              <div className="flex flex-col gap-2 pt-2 border-t border-border-light">
                {project.estimated_cost && (
                  <div className="flex items-center gap-2 text-lg">
                    <span className="text-text-light font-medium">Budget:</span>
                    <span className="font-bold text-text">${project.estimated_cost.toLocaleString()}</span>
                  </div>
                )}

                {project.address && (
                  <div className="flex items-center gap-1.5 text-sm text-text-light">
                    <span className="text-[0.875rem]">📍</span>
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

export default ContractorDashboard
