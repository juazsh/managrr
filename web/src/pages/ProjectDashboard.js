"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import projectService from "../services/projectService"
import { useAuth } from "../context/AuthContext"
import PhotosSection from "../components/dashboard/PhotosSection"
import UpdatesSection from "../components/dashboard/UpdatesSection"
import PaymentSummarySection from '../components/dashboard/PaymentSummarySection'
import ExpensesSection from "../components/dashboard/ExpensesSection"
import WorkLogsSection from "../components/dashboard/WorkLogsSection"

const ProjectDashboard = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedContractor, setSelectedContractor] = useState('all')
  const [contractors, setContractors] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [contractorDropdownOpen, setContractorDropdownOpen] = useState(false)

  useEffect(() => {
    loadContractors()
  }, [id])

  useEffect(() => {
    loadDashboard()
  }, [id, selectedContractor])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.project-dashboard-mobile-dropdown')) {
        setDropdownOpen(false)
      }
      if (contractorDropdownOpen && !event.target.closest('.contractor-filter-dropdown')) {
        setContractorDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen, contractorDropdownOpen])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")
      const params = selectedContractor !== 'all' ? { contract_id: selectedContractor } : {}
      const data = await projectService.getProjectDashboard(id, params)
      setDashboard(data)
      if (user?.user_type === "contractor" && user?.id) {
        setSelectedContractor(user.id)
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have permission to view this project dashboard.")
      } else if (err.response?.status === 404) {
        setError("Project not found.")
      } else {
        setError("Failed to load project dashboard.")
      }
    } finally {
      setLoading(false)
    }
  }

  const loadContractors = async () => {
    try {
      const data = await projectService.getProjectContractors(id)
      setContractors(data || [])
    } catch (err) {
      console.error("Failed to load contractors:", err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          <p>Loading project dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-lg text-text-muted text-center">{error}</p>
          <button onClick={() => navigate("/dashboard")} className="py-3 px-6 bg-primary text-white border-none rounded-md text-base font-bold cursor-pointer mt-4">
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const isContractor = user?.user_type === "contractor"
  const isOwner = user?.user_type === "house_owner" && dashboard.project.owner_id === user.id
  const isEmployee = user?.user_type === "employee"

  const renderOverviewSection = () => (
    <div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
          <h3 className="text-xl font-bold text-text mb-4">Project Details</h3>
          <div className="grid gap-4">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <span className="text-base text-text-muted font-semibold">Estimated Cost:</span>
              <span className="text-base text-text font-bold text-right break-words">${Number(dashboard.project.estimated_cost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <span className="text-base text-text-muted font-semibold">Address:</span>
              <span className="text-base text-text font-bold text-right break-words">{dashboard.project.address}</span>
            </div>
          </div>
          {dashboard.project.description && (
            <p className="mt-6 text-base text-text-light leading-relaxed">{dashboard.project.description}</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
          <h3 className="text-xl font-bold text-text mb-4">House Owner</h3>
          <div className="grid gap-4">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <span className="text-base text-text-muted font-semibold">Name:</span>
              <span className="text-base text-text font-bold text-right break-words">{dashboard.owner_info.name}</span>
            </div>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <span className="text-base text-text-muted font-semibold">Email:</span>
              <span className="text-base text-text font-bold text-right break-words">{dashboard.owner_info.email}</span>
            </div>
            {dashboard.owner_info.phone && (
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <span className="text-base text-text-muted font-semibold">Phone:</span>
                <span className="text-base text-text font-bold text-right break-words">{dashboard.owner_info.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {contractors.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
          <h3 className="text-xl font-bold text-text mb-4">Assigned Contractors</h3>
          <div className="grid gap-4">
            {contractors.map(contractor => (
              <div key={contractor.contract_id} className="p-5 bg-background-light rounded-xl border border-border-light transition-all duration-200">
                <div>
                  <div className="font-bold text-text mb-2 text-lg">{contractor.name}</div>
                  <div className="text-base text-text-light">{contractor.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderSectionContent = () => {
    const showContractorFilter = isOwner && contractors.length > 1 && activeSection !== "overview"

    return (
      <div>
        {showContractorFilter && (
          <div className="bg-white py-5 px-6 rounded-xl border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-8 flex items-center gap-4 flex-wrap">
            <label className="text-base font-bold text-text whitespace-nowrap">Filter by Contractor:</label>
            <div className="relative flex-1 min-w-[250px] contractor-filter-dropdown">
              <div
                className="w-full py-3.5 px-4 rounded-xl border-2 border-border bg-white text-text text-base font-semibold cursor-pointer flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                onClick={() => setContractorDropdownOpen(!contractorDropdownOpen)}
              >
                <span className="flex-1">
                  {selectedContractor === 'all'
                    ? 'All Contractors'
                    : contractors.find(c => c.contract_id === selectedContractor)?.name || 'All Contractors'}
                </span>
                <svg
                  className="transition-transform duration-200 text-primary"
                  style={{ transform: contractorDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {contractorDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[1000] overflow-hidden max-h-[300px] overflow-y-auto">
                  <button
                    className={`w-full py-3.5 px-4 text-base font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${selectedContractor === 'all' ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                    onClick={() => {
                      setSelectedContractor('all')
                      setContractorDropdownOpen(false)
                    }}
                  >
                    All Contractors
                  </button>
                  {contractors.map(contractor => (
                    <button
                      key={contractor.contract_id}
                      className={`w-full py-3.5 px-4 text-base font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 last:border-b-0 ${selectedContractor === contractor.contract_id ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                      onClick={() => {
                        setSelectedContractor(contractor.contract_id)
                        setContractorDropdownOpen(false)
                      }}
                    >
                      {contractor.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-8 border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          {activeSection === "overview" && renderOverviewSection()}
          {activeSection === "photos" && <PhotosSection projectId={id} photos={dashboard.recent_photos} canUpload={isContractor || isOwner} onPhotoUploaded={loadDashboard} contractorFilter={selectedContractor} />}
          {activeSection === "updates" && <UpdatesSection projectId={id} updates={dashboard.latest_updates} isContractor={isContractor} onUpdateCreated={loadDashboard} contractorFilter={selectedContractor} />}
          {activeSection === "expenses" && <ExpensesSection projectId={id} expenses={dashboard.recent_expenses} summary={dashboard.expense_summary} canAdd={isOwner || isContractor} onExpenseAdded={loadDashboard} contractorFilter={selectedContractor} />}
          {activeSection === "payments" && <PaymentSummarySection projectId={id} isOwner={isOwner} isContractor={isContractor} onPaymentAdded={loadDashboard} contractorFilter={selectedContractor} />}
          {activeSection === "worklogs" && <WorkLogsSection projectId={id} contractorFilter={selectedContractor} />}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 bg-background min-h-screen">
      <div className="mb-8">
        <button onClick={() => navigate("/dashboard")} className="text-primary no-underline text-base font-semibold mb-4 inline-block cursor-pointer bg-none border-none p-0">
          ← Back
        </button>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-[2rem] font-bold text-text m-0">{dashboard.project.title}</h1>
          <span className="py-2 px-4 rounded-full text-base font-bold" style={getStatusStyle(dashboard.project.status)}>
            {dashboard.project.status}
          </span>
        </div>
      </div>

      {!isEmployee && (
        <>
          <div className="hidden mb-8 relative max-[768px]:block project-dashboard-mobile-dropdown">
            <div
              className="w-full py-4 px-5 rounded-lg border-2 border-border bg-white text-text text-lg font-semibold cursor-pointer flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="flex-1">
                {activeSection === "overview" && "Overview"}
                {activeSection === "photos" && "Project Photos"}
                {activeSection === "updates" && "Project Updates"}
                {activeSection === "expenses" && "Expenses"}
                {activeSection === "payments" && "Payment Summary"}
                {activeSection === "worklogs" && "Work Logs"}
              </span>
              <svg
                className="transition-transform duration-200 text-primary"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[1000] overflow-hidden">
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${activeSection === "overview" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("overview")
                    setDropdownOpen(false)
                  }}
                >
                  Overview
                </button>
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${activeSection === "photos" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("photos")
                    setDropdownOpen(false)
                  }}
                >
                  Project Photos
                </button>
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${activeSection === "updates" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("updates")
                    setDropdownOpen(false)
                  }}
                >
                  Project Updates
                </button>
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${activeSection === "expenses" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("expenses")
                    setDropdownOpen(false)
                  }}
                >
                  Expenses
                </button>
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b border-border-light cursor-pointer text-left transition-all duration-200 ${activeSection === "payments" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("payments")
                    setDropdownOpen(false)
                  }}
                >
                  Payment Summary
                </button>
                <button
                  className={`w-full py-4 px-5 text-lg font-medium bg-transparent border-none border-b-0 cursor-pointer text-left transition-all duration-200 ${activeSection === "worklogs" ? '!bg-primary-dark !text-white font-bold hover:!bg-[#163a7e]' : '!text-text hover:bg-[rgba(37,99,235,0.08)]'}`}
                  onClick={() => {
                    setActiveSection("worklogs")
                    setDropdownOpen(false)
                  }}
                >
                  Work Logs
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-8 items-start max-[768px]:block">
            <div className="w-[280px] bg-white rounded-xl p-4 border border-border-light shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col gap-2 sticky top-8 max-[768px]:hidden project-dashboard-sidebar">
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "overview" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("overview")}
              >
                Overview
              </button>
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "photos" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("photos")}
              >
                Project Photos
              </button>
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "updates" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("updates")}
              >
                Project Updates
              </button>
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "expenses" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("expenses")}
              >
                Expenses
              </button>
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "payments" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("payments")}
              >
                Payment Summary
              </button>
              <button
                className={`py-5 px-6 text-lg font-semibold bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 text-left min-h-[60px] flex items-center ${activeSection === "worklogs" ? '!bg-primary-dark !text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:!bg-[#163a7e] hover:translate-x-1' : '!text-text-muted hover:bg-[rgba(37,99,235,0.08)] hover:translate-x-1'}`}
                onClick={() => setActiveSection("worklogs")}
              >
                Work Logs
              </button>
            </div>

            <div className="flex-1 min-w-0">
              {renderSectionContent()}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const getStatusStyle = (status) => {
  const styles = {
    draft: { backgroundColor: "#FEF3C7", color: "#92400E" },
    active: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    completed: { backgroundColor: "#D1FAE5", color: "#065F46" }
  }
  return styles[status] || {}
}

export default ProjectDashboard