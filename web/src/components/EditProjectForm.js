"use client"

import { useState, useEffect } from "react"
import projectService from "../services/projectService"
import AssignContractorModal from "./AssignContractorModal"

const EditProjectForm = ({ project, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [assignedContractors, setAssignedContractors] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    estimated_cost: project.estimated_cost || "",
    address: project.address || "",
    status: project.status || "draft",
  })

  useEffect(() => {
    if (project.contractors && Array.isArray(project.contractors)) {
      setAssignedContractors(project.contractors)
    }
  }, [project.contractors])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRemoveContractor = async (contractorId) => {
    try {
      await projectService.removeContractor(project.id, contractorId)
      setAssignedContractors(assignedContractors.filter(c => c.contractor_id !== contractorId))
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove contractor")
    }
  }

  const handleAssignContractor = async (contractorEmail) => {
    try {
      const response = await projectService.assignContractor(project.id, contractorEmail)
      const updatedProject = await projectService.getProjectById(project.id)
      if (updatedProject.project.contractors) {
        setAssignedContractors(updatedProject.project.contractors)
      }
      setShowAssignModal(false)
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to assign contractor")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Project title is required")
      return
    }

    if (!formData.description.trim()) {
      setError("Project description is required")
      return
    }

    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      setError("Estimated cost must be greater than 0")
      return
    }

    if (!formData.address.trim()) {
      setError("Project address is required")
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
    } catch (err) {
      setError(err.message || "Failed to update project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-border">
      <h2 className="text-2xl font-bold text-text mb-6">Edit Project</h2>

      {error && <div className="bg-error-light text-error p-4 rounded-md mb-6 text-sm border border-error">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label htmlFor="title" className="text-sm font-semibold text-text mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 bg-background-light disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="description" className="text-sm font-semibold text-text mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            rows="5"
            className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 resize-y bg-background-light leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="estimated_cost" className="text-sm font-semibold text-text mb-2">
            Estimated Cost *
          </label>
          <input
            type="number"
            id="estimated_cost"
            name="estimated_cost"
            value={formData.estimated_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            disabled={loading}
            className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 bg-background-light disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="text-sm font-semibold text-text mb-2">
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 bg-background-light disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="status" className="text-sm font-semibold text-text mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 bg-background-light disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-text">Assigned Contractors</label>
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="py-2 px-4 text-sm font-semibold bg-primary text-white border-none rounded cursor-pointer transition-all duration-200"
            >
              + Add Contractor
            </button>
          </div>
          {assignedContractors.length === 0 ? (
            <p className="p-4 bg-background-light rounded-md text-text-light text-sm">No contractors assigned yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assignedContractors.map((contractor) => (
                <div key={contractor.contractor_id} className="flex justify-between items-center p-4 bg-background-light rounded-md border border-border">
                  <div className="flex flex-col gap-1">
                    <strong>{contractor.name}</strong>
                    <span className="text-sm text-text-light">{contractor.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContractor(contractor.contractor_id)}
                    className="py-2 px-4 text-sm font-semibold bg-error-light text-error border border-error rounded-sm cursor-pointer transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-end mt-4 flex-wrap">
          <button type="button" onClick={onCancel} className="py-3.5 px-6 text-base font-semibold bg-white text-text border border-border rounded-md cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className="py-3.5 px-6 text-base font-semibold bg-black text-white border-none rounded-md cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {showAssignModal && (
        <AssignContractorModal
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignContractor}
        />
      )}
    </div>
  )
}

export default EditProjectForm