"use client"

import { useState, useEffect } from "react"
import projectService from "../services/projectService"
import AssignContractorModal from "./AssignContractorModal"
import { theme } from "../theme"

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
    <div style={styles.container}>
      <h2 style={styles.title}>Edit Project</h2>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            rows="5"
            style={styles.textarea}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="estimated_cost" style={styles.label}>
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
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            style={styles.select}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <div style={styles.contractorHeader}>
            <label style={styles.label}>Assigned Contractors</label>
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              style={styles.addButton}
            >
              + Add Contractor
            </button>
          </div>
          {assignedContractors.length === 0 ? (
            <p style={styles.noContractors}>No contractors assigned yet</p>
          ) : (
            <div style={styles.contractorList}>
              {assignedContractors.map((contractor) => (
                <div key={contractor.contractor_id} style={styles.contractorItem}>
                  <div style={styles.contractorInfo}>
                    <strong>{contractor.name}</strong>
                    <span style={styles.contractorEmail}>{contractor.email}</span>
                  </div>
                  <button
                    type="button"
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

        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...styles.saveButton,
              ...(loading ? styles.buttonDisabled : {}),
            }}
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

const styles = {
  container: {
    backgroundColor: theme.colors.white,
    padding: "2rem",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: "1.5rem",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: "1rem",
    borderRadius: theme.borderRadius.md,
    marginBottom: "1.5rem",
    fontSize: theme.typography.small.fontSize,
    border: `1px solid ${theme.colors.error}`,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.5rem",
  },
  input: {
    padding: "0.875rem 1rem",
    fontSize: theme.typography.body.fontSize,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
  },
  textarea: {
    padding: "0.875rem 1rem",
    fontSize: theme.typography.body.fontSize,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily,
    resize: "vertical",
    backgroundColor: theme.colors.inputBg,
    lineHeight: "1.6",
  },
  select: {
    padding: "0.875rem 1rem",
    fontSize: theme.typography.body.fontSize,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
  },
  contractorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  noContractors: {
    padding: "1rem",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
  },
  contractorList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  contractorItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  contractorInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  contractorEmail: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  removeButton: {
    padding: "0.5rem 1rem",
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    border: `1px solid ${theme.colors.error}`,
    borderRadius: theme.borderRadius.sm,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  addButton: {
    padding: "0.5rem 1rem",
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.sm,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  cancelButton: {
    padding: "0.875rem 1.5rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  saveButton: {
    padding: "0.875rem 1.5rem",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
}

export default EditProjectForm