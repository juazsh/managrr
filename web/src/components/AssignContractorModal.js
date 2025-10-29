"use client"

import { useState, useEffect } from "react"
import projectService from "../services/projectService"
import { theme } from "../theme"

const AssignContractorModal = ({ onAssign, onClose, currentContractors = [] }) => {
  const [contractors, setContractors] = useState([])
  const [selectedContractors, setSelectedContractors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    alert("useEffect");
    fetchContractors()
  }, [])

  const fetchContractors = async () => {
    try {
      setFetchLoading(true)
      alert("fetching contractors");
      const data = await projectService.listContractors()
      const currentIds = currentContractors.map(c => c.contractor_id)
      const available = data.filter(c => !currentIds.includes(c.id))
      setContractors(available)
    } catch (err) {
      setError("Failed to load contractors")
    } finally {
      setFetchLoading(false)
    }
  }

  const filteredContractors = contractors.filter(contractor =>
    contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleContractor = (contractorId) => {
    setSelectedContractors(prev =>
      prev.includes(contractorId)
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (selectedContractors.length === 0) {
      setError("Please select at least one contractor")
      return
    }

    try {
      setLoading(true)
      await onAssign(selectedContractors)
      setSuccess(`${selectedContractors.length} contractor(s) assigned successfully!`)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    content: {
      background: theme.colors.white,
      padding: "2rem",
      borderRadius: theme.borderRadius.lg,
      width: "100%",
      maxWidth: "600px",
      maxHeight: "80vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: theme.shadows.xl,
    },
    title: {
      margin: "0 0 1.5rem 0",
      color: theme.colors.text,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
      letterSpacing: "-0.01em",
    },
    searchBox: {
      marginBottom: "1rem",
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem",
      border: `2px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      outline: "none",
    },
    contractorListWrapper: {
      flex: 1,
      minHeight: 0,
      marginBottom: "1rem",
    },
    contractorList: {
      height: "300px",
      overflowY: "auto",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
    },
    contractorItem: {
      display: "flex",
      alignItems: "center",
      padding: "0.875rem 1rem",
      borderBottom: `1px solid ${theme.colors.border}`,
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    contractorItemHover: {
      backgroundColor: "#f9fafb",
    },
    contractorItemSelected: {
      backgroundColor: theme.colors.backgroundLight,
    },
    checkbox: {
      width: "18px",
      height: "18px",
      marginRight: "1rem",
      cursor: "pointer",
      flexShrink: 0,
    },
    contractorInfo: {
      flex: 1,
      minWidth: 0,
    },
    contractorName: {
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: "0.25rem",
    },
    contractorEmail: {
      fontSize: theme.typography.small.fontSize,
      color: theme.colors.textLight,
    },
    emptyState: {
      padding: "2rem",
      textAlign: "center",
      color: theme.colors.textLight,
    },
    loadingState: {
      padding: "2rem",
      textAlign: "center",
      color: theme.colors.textLight,
    },
    errorMessage: {
      padding: "0.75rem",
      backgroundColor: "#FEE2E2",
      color: "#B91C1C",
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.small.fontSize,
      marginBottom: "1rem",
      border: "1px solid #FCA5A5",
    },
    successMessage: {
      padding: "0.75rem",
      backgroundColor: "#D1FAE5",
      color: "#065F46",
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.small.fontSize,
      marginBottom: "1rem",
      border: "1px solid #6EE7B7",
    },
    selectedCount: {
      marginBottom: "1rem",
      fontSize: theme.typography.small.fontSize,
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    actions: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      paddingTop: "1rem",
      borderTop: `1px solid ${theme.colors.border}`,
    },
    cancelButton: {
      padding: "0.875rem 1.5rem",
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      border: `2px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.white,
      color: theme.colors.text,
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontFamily: theme.typography.fontFamily,
    },
    submitButton: {
      padding: "0.875rem 1.5rem",
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      border: "none",
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontFamily: theme.typography.fontFamily,
    },
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Assign Contractors</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {selectedContractors.length > 0 && (
          <div style={styles.selectedCount}>
            {selectedContractors.length} contractor(s) selected
          </div>
        )}

        <div style={styles.contractorListWrapper}>
          <div style={styles.contractorList}>
            {fetchLoading ? (
              <div style={styles.loadingState}>Loading contractors...</div>
            ) : filteredContractors.length === 0 ? (
              <div style={styles.emptyState}>
                {contractors.length === 0 
                  ? "No available contractors found" 
                  : "No contractors match your search"}
              </div>
            ) : (
              filteredContractors.map((contractor) => {
                const isSelected = selectedContractors.includes(contractor.id)
                return (
                  <div
                    key={contractor.id}
                    style={{
                      ...styles.contractorItem,
                      ...(isSelected ? styles.contractorItemSelected : {}),
                    }}
                    onClick={() => handleToggleContractor(contractor.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "#f9fafb"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={styles.checkbox}
                    />
                    <div style={styles.contractorInfo}>
                      <div style={styles.contractorName}>{contractor.name}</div>
                      <div style={styles.contractorEmail}>({contractor.email})</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={onClose} style={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              ...styles.submitButton,
              ...(loading || selectedContractors.length === 0 ? styles.submitButtonDisabled : {}),
            }}
            disabled={loading || selectedContractors.length === 0}
          >
            {loading ? "Assigning..." : `Assign (${selectedContractors.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignContractorModal