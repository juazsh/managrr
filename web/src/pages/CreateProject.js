"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import projectService from "../services/projectService"

const CreateProject = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_cost: "",
    address: "",
  })
  const [photos, setPhotos] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(files)
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

    if (!formData.estimated_cost || Number.parseFloat(formData.estimated_cost) <= 0) {
      setError("Please enter a valid estimated cost")
      return
    }

    if (!formData.address.trim()) {
      setError("Project address is required")
      return
    }

    try {
      setLoading(true)
      const projectData = {
        ...formData,
        photos,
      }

      const response = await projectService.createProject(projectData)
      navigate(`/projects/${response.project.id}`)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[800px] mx-auto p-8 md:p-8 px-4 min-h-[calc(100vh-100px)]">
      <div className="bg-white p-8 rounded-lg shadow-md border border-border-light">
        <h1 className="text-[2rem] font-bold text-text mb-6 tracking-tight">Create New Project</h1>

        {error && <div className="bg-error-light text-error p-4 rounded-md mb-6 text-sm border border-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-text mb-2">
              Project Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Kitchen Renovation"
              className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 font-sans bg-[#F9FAFB] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-text mb-2">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the project scope and requirements..."
              className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 font-sans resize-y bg-[#F9FAFB] leading-relaxed focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              rows="5"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-text mb-2">
              Estimated Cost <span className="text-error">*</span>
            </label>
            <div className="flex items-center border border-border rounded-md overflow-hidden bg-white transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <span className="py-3.5 px-4 bg-background-light text-text font-semibold text-base">$</span>
              <input
                type="number"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 py-3.5 px-4 text-base border-none outline-none font-sans bg-[#F9FAFB]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-text mb-2">
              Address <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main St, City, State ZIP"
              className="py-3.5 px-4 text-base border border-border rounded-md outline-none transition-all duration-200 font-sans bg-[#F9FAFB] focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-text mb-2">Project Photos</label>
            <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="p-3 text-sm border border-border rounded-md cursor-pointer bg-[#F9FAFB]" />
            {photos.length > 0 && <p className="mt-2 text-sm text-text-light">{photos.length} file(s) selected</p>}
          </div>

          <div className="flex gap-4 justify-end mt-4 flex-wrap">
            <button type="button" onClick={() => navigate("/dashboard")} className="py-3.5 px-6 text-base font-semibold bg-white text-text border border-border rounded-md cursor-pointer transition-all duration-200 flex-1 min-w-[120px] hover:bg-background-light disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="py-3.5 px-6 text-base font-semibold bg-black text-white border-none rounded-md cursor-pointer transition-all duration-200 flex-1 min-w-[120px] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
