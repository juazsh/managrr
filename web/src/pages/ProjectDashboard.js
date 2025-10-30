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
  const [activeTab, setActiveTab] = useState("photos")
  const [selectedContractor, setSelectedContractor] = useState('all')
  const [contractors, setContractors] = useState([])

  useEffect(() => {
    loadContractors()
  }, [id])

  useEffect(() => {
    loadDashboard()
  }, [id, selectedContractor])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")
      const params = selectedContractor !== 'all' ? { contractor_id: selectedContractor } : {}
      const data = await projectService.getProjectDashboard(id, params)
      setDashboard(data)
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

  return (
    <div style={styles.container}>
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

      <div style={styles.projectInfo}>
        <div style={styles.infoCard}>
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

        <div style={styles.infoCard}>
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

      {contractors.length > 1 && (
        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>Filter by Contractor:</label>
          <select 
            value={selectedContractor} 
            onChange={(e) => setSelectedContractor(e.target.value)}
            style={styles.filterDropdown}
          >
            <option value="all">All Contractors</option>
            {contractors.map(contractor => (
              <option key={contractor.contractor_id} value={contractor.contractor_id}>
                {contractor.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isEmployee && (
        <>
          <div className="desktop-tabs" style={styles.tabs}>
            <button
              style={activeTab === "photos" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab("photos")}
            >
              📷 Progress Photos
            </button>
            <button
              style={activeTab === "updates" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab("updates")}
            >
              📝 Updates
            </button>
            <button
              style={activeTab === "expenses" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab("expenses")}
            >
              💰 Expenses
            </button>
            <button
              style={activeTab === 'payments' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab('payments')}
            >
              💳 Payment Summary
            </button>
            <button
              style={activeTab === "worklogs" ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => setActiveTab("worklogs")}
            >
              ⏰ Work Logs
            </button>
          </div>

          <div className="mobile-dropdown" style={styles.mobileDropdown}>
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} style={styles.dropdown}>
              <option value="photos">📷 Progress Photos</option>
              <option value="updates">📝 Updates</option>
              <option value="expenses">💰 Expenses</option>
              <option value="payments">💳 Payment Summary</option>
              <option value="worklogs">⏰ Work Logs</option>
            </select>
          </div>
        </>
      )}

      <div style={styles.content}>
        {activeTab === "photos" && <PhotosSection projectId={id} photos={dashboard.recent_photos} canUpload={isContractor || isOwner} onPhotoUploaded={loadDashboard} />}
        {activeTab === "updates" && <UpdatesSection projectId={id} updates={dashboard.latest_updates} isContractor={isContractor} onUpdateCreated={loadDashboard} />}
        {activeTab === "expenses" && <ExpensesSection projectId={id} isOwner={isOwner} isContractor={isContractor} contractorFilter={selectedContractor} />}
        {activeTab === "payments" && <PaymentSummarySection projectId={id} contractorFilter={selectedContractor} />}
        {activeTab === "worklogs" && <WorkLogsSection projectId={id} contractorFilter={selectedContractor} />}
      </div>
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
    padding: "2rem",
    backgroundColor: theme.colors.background,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "2rem",
  },
  backButtonLink: {
    color: theme.colors.primary,
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
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
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  projectInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  infoCard: {
    backgroundColor: theme.colors.cardBg,
    padding: "1.5rem",
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.sm,
  },
  infoTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "1rem",
  },
  infoGrid: {
    display: "grid",
    gap: "0.75rem",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "0.875rem",
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  value: {
    fontSize: "0.875rem",
    color: theme.colors.text,
    fontWeight: "600",
  },
  description: {
    marginTop: "1rem",
    fontSize: "0.875rem",
    color: theme.colors.textLight,
    lineHeight: "1.5",
  },
  contactInfo: {
    display: "grid",
    gap: "0.75rem",
  },
  contactItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterContainer: {
    backgroundColor: theme.colors.cardBg,
    padding: "1rem 1.5rem",
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.sm,
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: theme.colors.text,
  },
  filterDropdown: {
    padding: "0.5rem 1rem",
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: "0.875rem",
    cursor: "pointer",
    outline: "none",
    minWidth: "200px",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    borderBottom: `2px solid ${theme.colors.border}`,
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: theme.colors.textMuted,
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "-2px",
  },
  activeTab: {
    color: theme.colors.primary,
    borderBottomColor: theme.colors.primary,
    fontWeight: "600",
  },
  mobileDropdown: {
    display: "none",
    marginBottom: "2rem",
  },
  dropdown: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.cardBg,
    color: theme.colors.text,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  content: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
    padding: "2rem",
    boxShadow: theme.shadows.sm,
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
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "1rem",
  },
}

export default ProjectDashboard