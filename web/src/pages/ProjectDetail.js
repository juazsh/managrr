"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import projectService from "../services/projectService"
import EditProjectForm from "../components/EditProjectForm"
import PhotoUploadSection from "../components/PhotoUploadSection"
import AssignContractorModal from "../components/AssignContractorModal"

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
    return <div className="text-center p-8 text-text-light">Loading project...</div>
  }

  if (error) {
    return <div className="p-4 bg-[#FEE2E2] text-[#B91C1C] rounded-md my-8 mx-auto max-w-[600px]">{error}</div>
  }

  if (!project) {
    return <div className="p-4 bg-[#FEE2E2] text-[#B91C1C] rounded-md my-8 mx-auto max-w-[600px]">Project not found</div>
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="flex gap-3 items-center flex-wrap justify-between">
        <button onClick={() => navigate("/projects")} className="py-3 px-5 text-base font-semibold border-2 border-border rounded-md bg-white text-text cursor-pointer transition-all duration-200">
          ← Back to Projects
        </button>
        <div className="flex gap-3">
          <Link to={`/projects/${id}/dashboard`} className="inline-flex items-center gap-2 py-3 px-5 bg-primary text-white no-underline rounded-md text-base font-semibold transition-all duration-200 shadow-sm border-none cursor-pointer">
            📊 View Dashboard
          </Link>
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="py-3 px-5 text-base font-semibold border-none rounded-md bg-primary text-white cursor-pointer transition-all duration-200">
                ✏️ Edit
              </button>
              <button onClick={handleDelete} className="py-3 px-5 text-base font-semibold border-none rounded-md bg-[#DC2626] text-white cursor-pointer transition-all duration-200">
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
          <div className="bg-white p-8 rounded-lg shadow-md mt-8">
            <h1 className="m-0 mb-4 text-text text-[2rem] font-bold">{project.title}</h1>
            <div className="flex gap-4 mb-6 flex-wrap">
              <span className="py-2 px-4 rounded-md text-sm font-semibold" style={getStatusStyle(project.status)}>{project.status}</span>
              <span className="py-2 px-4 bg-background-light rounded-md text-sm font-semibold">Estimated Cost: ${Number(project.estimated_cost).toLocaleString()}</span>
            </div>
            <p className="text-text-light leading-relaxed mb-4">{project.description}</p>
            <p className="text-text">
              <strong>Address:</strong> {project.address}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-text text-[1.5rem] font-bold">Assigned Contractors</h2>
              <button onClick={() => setShowAssignModal(true)} className="py-3 px-5 text-base font-semibold border-none rounded-md bg-primary text-white cursor-pointer transition-all duration-200">
                + Add Contractor
              </button>
            </div>
            {contractors.length === 0 ? (
              <p className="p-8 text-center text-text-light bg-background-light rounded-md">No contractors assigned yet</p>
            ) : (
              <div className="flex flex-col gap-4">
                {contractors.map((contractor) => (
                  <div key={contractor.contractor_id} className="flex justify-between items-center p-5 bg-background-light rounded-md border border-border">
                    <div className="flex-1">
                      <div className="font-semibold text-text mb-1">{contractor.name}</div>
                      <div className="text-sm text-text-light mb-1">{contractor.email}</div>
                      <div className="text-sm text-text-light">
                        Assigned: {new Date(contractor.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveContractor(contractor.contractor_id)}
                      className="py-2 px-4 text-sm font-semibold border-none rounded-md bg-[#FEE2E2] text-[#B91C1C] cursor-pointer transition-all duration-200"
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

export default ProjectDetail