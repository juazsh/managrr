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
import { theme } from "../theme"

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
      const params = selectedContractor !== 'all' ? { contractor_id: selectedContractor } : {}
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
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading project dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
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
      <div style={styles.projectInfo}>
        <div style={styles.infoCard} className="project-dashboard-info-card">
          <h3 style={styles.infoTitle}>Project Details</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Estimated Cost:</span>
              <span style={styles.value}>${Number(dashboard.project.estimated_cost).toLocaleString()}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Address:</span>
              <span style={styles.value}>{dashboard.project.address}</span>
            </div>
          </div>
          {dashboard.project.description && (
            <p style={styles.description}>{dashboard.project.description}</p>
          )}
        </div>

        <div style={styles.infoCard} className="project-dashboard-info-card">
          <h3 style={styles.infoTitle}>House Owner</h3>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{dashboard.owner_info.name}</span>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{dashboard.owner_info.email}</span>
            </div>
            {dashboard.owner_info.phone && (
              <div style={styles.contactItem}>
                <span style={styles.label}>Phone:</span>
                <span style={styles.value}>{dashboard.owner_info.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {contractors.length > 0 && (
        <div style={styles.infoCard} className="project-dashboard-info-card">
          <h3 style={styles.infoTitle}>Assigned Contractors</h3>
          <div style={styles.contractorList}>
            {contractors.map(contractor => (
              <div key={contractor.contractor_id} style={styles.contractorItem}>
                <div>
                  <div style={styles.contractorName}>{contractor.name}</div>
                  <div style={styles.contractorEmail}>{contractor.email}</div>
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
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Filter by Contractor:</label>
            <div style={{position: "relative", flex: 1, minWidth: "250px"}} className="contractor-filter-dropdown">
              <div 
                style={styles.contractorDropdown}
                onClick={() => setContractorDropdownOpen(!contractorDropdownOpen)}
              >
                <span style={styles.dropdownLabel}>
                  {selectedContractor === 'all' 
                    ? 'All Contractors' 
                    : contractors.find(c => c.contractor_id === selectedContractor)?.name || 'All Contractors'}
                </span>
                <svg 
                  style={{
                    ...styles.dropdownCaret,
                    transform: contractorDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                  }}
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
                <div style={styles.contractorDropdownMenu}>
                  <button 
                    style={selectedContractor === 'all' ? {...styles.contractorDropdownItem, ...styles.contractorDropdownItemActive} : styles.contractorDropdownItem}
                    className="contractor-dropdown-item"
                    onClick={() => {
                      setSelectedContractor('all')
                      setContractorDropdownOpen(false)
                    }}
                  >
                    All Contractors
                  </button>
                  {contractors.map(contractor => (
                    <button 
                      key={contractor.contractor_id}
                      style={selectedContractor === contractor.contractor_id ? {...styles.contractorDropdownItem, ...styles.contractorDropdownItemActive} : styles.contractorDropdownItem}
                      className="contractor-dropdown-item"
                      onClick={() => {
                        setSelectedContractor(contractor.contractor_id)
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

        <div style={styles.content}>
          {activeSection === "overview" && renderOverviewSection()}
          {activeSection === "photos" && <PhotosSection projectId={id} photos={dashboard.recent_photos} canUpload={isContractor || isOwner} onPhotoUploaded={loadDashboard} />}
          {activeSection === "updates" && <UpdatesSection projectId={id} updates={dashboard.latest_updates} isContractor={isContractor} onUpdateCreated={loadDashboard} />}
          {activeSection === "expenses" && <ExpensesSection projectId={id} isOwner={isOwner} isContractor={isContractor} contractorFilter={selectedContractor} />}
          {activeSection === "payments" && <PaymentSummarySection projectId={id} contractorFilter={selectedContractor} />}
          {activeSection === "worklogs" && <WorkLogsSection projectId={id} contractorFilter={selectedContractor} />}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container} className="project-dashboard-container">
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backButtonLink}>
          ← Back
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{dashboard.project.title}</h1>
          <span style={{ ...styles.statusBadge, ...getStatusStyle(dashboard.project.status) }}>
            {dashboard.project.status}
          </span>
        </div>
      </div>

      {!isEmployee && (
        <>
          <div style={styles.mobileDropdown} className="project-dashboard-mobile-dropdown">
            <div 
              style={styles.customDropdown}
              className="project-dashboard-custom-dropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span style={styles.dropdownLabel}>
                {activeSection === "overview" && "Overview"}
                {activeSection === "photos" && "Project Photos"}
                {activeSection === "updates" && "Project Updates"}
                {activeSection === "expenses" && "Expenses"}
                {activeSection === "payments" && "Payment Summary"}
                {activeSection === "worklogs" && "Work Logs"}
              </span>
              <svg 
                style={{
                  ...styles.dropdownCaret,
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                }}
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
              <div style={styles.dropdownMenu}>
                <button 
                  style={activeSection === "overview" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
                  onClick={() => {
                    setActiveSection("overview")
                    setDropdownOpen(false)
                  }}
                >
                  Overview
                </button>
                <button 
                  style={activeSection === "photos" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
                  onClick={() => {
                    setActiveSection("photos")
                    setDropdownOpen(false)
                  }}
                >
                  Project Photos
                </button>
                <button 
                  style={activeSection === "updates" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
                  onClick={() => {
                    setActiveSection("updates")
                    setDropdownOpen(false)
                  }}
                >
                  Project Updates
                </button>
                <button 
                  style={activeSection === "expenses" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
                  onClick={() => {
                    setActiveSection("expenses")
                    setDropdownOpen(false)
                  }}
                >
                  Expenses
                </button>
                <button 
                  style={activeSection === "payments" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
                  onClick={() => {
                    setActiveSection("payments")
                    setDropdownOpen(false)
                  }}
                >
                  Payment Summary
                </button>
                <button 
                  style={activeSection === "worklogs" ? {...styles.dropdownItem, ...styles.dropdownItemActive} : styles.dropdownItem}
                  className="project-dashboard-dropdown-item"
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

          <div style={styles.layoutWrapper} className="project-dashboard-layout">
            <div style={styles.sidebar} className="project-dashboard-sidebar">
              <button
                style={activeSection === "overview" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("overview")}
              >
                Overview
              </button>
              <button
                style={activeSection === "photos" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("photos")}
              >
                Project Photos
              </button>
              <button
                style={activeSection === "updates" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("updates")}
              >
                Project Updates
              </button>
              <button
                style={activeSection === "expenses" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("expenses")}
              >
                Expenses
              </button>
              <button
                style={activeSection === "payments" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("payments")}
              >
                Payment Summary
              </button>
              <button
                style={activeSection === "worklogs" ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
                onClick={() => setActiveSection("worklogs")}
              >
                Work Logs
              </button>
            </div>

            <div style={styles.mainContent}>
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

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "1rem",
    backgroundColor: theme.colors.background,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "2rem",
  },
  backButtonLink: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "1rem",
    display: "inline-block",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "0",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: theme.colors.text,
    margin: "0",
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    fontSize: "1rem",
    fontWeight: "700",
  },
  mobileDropdown: {
    display: "none",
    marginBottom: "2rem",
    position: "relative",
  },
  customDropdown: {
    width: "100%",
    padding: "1rem 1.25rem",
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    fontSize: "1.125rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
  },
  dropdownLabel: {
    flex: 1,
  },
  dropdownCaret: {
    transition: "transform 0.2s ease",
    color: theme.colors.primary,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    marginTop: "0.5rem",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    zIndex: "1000",
    overflow: "hidden",
  },
  dropdownItem: {
    width: "100%",
    padding: "1rem 1.25rem",
    fontSize: "1.125rem",
    fontWeight: "500",
    color: theme.colors.text,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  dropdownItemActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontWeight: "700",
  },
  layoutWrapper: {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start",
  },
  sidebar: {
    width: "280px",
    backgroundColor: theme.colors.white,
    borderRadius: "12px",
    padding: "1rem",
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    position: "sticky",
    top: "2rem",
  },
  sidebarItem: {
    padding: "1.25rem 1.5rem",
    fontSize: "1.125rem",
    fontWeight: "600",
    color: theme.colors.textMuted,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
  },
  sidebarItemActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  filterContainer: {
    backgroundColor: theme.colors.white,
    padding: "1.25rem 1.5rem",
    borderRadius: "12px",
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: "1rem",
    fontWeight: "700",
    color: theme.colors.text,
    whiteSpace: "nowrap",
  },
  contractorDropdown: {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "12px",
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
  },
  contractorDropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    marginTop: "0.5rem",
    backgroundColor: theme.colors.white,
    borderRadius: "12px",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    zIndex: "1000",
    overflow: "hidden",
    maxHeight: "300px",
    overflowY: "auto",
  },
  contractorDropdownItem: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    fontWeight: "500",
    color: theme.colors.text,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  contractorDropdownItemActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontWeight: "700",
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: "12px",
    padding: "2rem",
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  projectInfo: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    padding: "1.5rem",
    borderRadius: "12px",
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease",
  },
  infoTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "1rem",
  },
  infoGrid: {
    display: "grid",
    gap: "1rem",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  label: {
    fontSize: "1rem",
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  value: {
    fontSize: "1rem",
    color: theme.colors.text,
    fontWeight: "700",
    textAlign: "right",
    wordBreak: "break-word",
  },
  description: {
    marginTop: "1.5rem",
    fontSize: "1rem",
    color: theme.colors.textLight,
    lineHeight: "1.6",
  },
  contactInfo: {
    display: "grid",
    gap: "1rem",
  },
  contactItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  contractorList: {
    display: "grid",
    gap: "1rem",
  },
  contractorItem: {
    padding: "1.25rem",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: "12px",
    border: `1px solid ${theme.colors.borderLight}`,
    transition: "all 0.2s ease",
  },
  contractorName: {
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "0.5rem",
    fontSize: "1.125rem",
  },
  contractorEmail: {
    fontSize: "1rem",
    color: theme.colors.textLight,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "1rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: `4px solid ${theme.colors.border}`,
    borderTop: `4px solid ${theme.colors.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "1rem",
  },
  errorIcon: {
    fontSize: "3rem",
  },
  errorText: {
    fontSize: "1.125rem",
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  backButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: theme.colors.primary,
    color: "#FFFFFF",
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "1rem",
  },
}

const mediaQuery = `
@media (max-width: 768px) {
  .project-dashboard-sidebar {
    display: none !important;
  }
  .project-dashboard-mobile-dropdown {
    display: block !important;
  }
  .project-dashboard-layout {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .project-dashboard-container {
    padding: 2rem !important;
  }
}

.project-dashboard-sidebar button:hover:not(:disabled) {
  background-color: rgba(37, 99, 235, 0.08);
  transform: translateX(4px);
}

.project-dashboard-custom-dropdown:hover {
  border-color: ${theme.colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.project-dashboard-dropdown-item:hover {
  background-color: rgba(37, 99, 235, 0.08);
}

.project-dashboard-dropdown-item:last-child {
  border-bottom: none;
}

.project-dashboard-info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.contractor-filter-dropdown > div:first-child:hover {
  border-color: ${theme.colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.contractor-dropdown-item:hover {
  background-color: rgba(37, 99, 235, 0.08);
}

.contractor-dropdown-item:last-child {
  border-bottom: none;
}
`

if (typeof document !== 'undefined') {
  const styleId = 'project-dashboard-responsive-styles'
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = mediaQuery
    document.head.appendChild(styleElement)
  }
}

export default ProjectDashboard