"use client"

import { useState, useEffect } from "react"
import projectService from "../services/projectService"

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

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg w-full max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="m-0 mb-6 text-text text-[1.5rem] font-bold tracking-tight">Assign Contractors</h2>

        {error && <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-md text-sm mb-4 border border-[#FCA5A5]">{error}</div>}
        {success && <div className="p-3 bg-[#D1FAE5] text-[#065F46] rounded-md text-sm mb-4 border border-[#6EE7B7]">{success}</div>}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border-2 border-border rounded-md text-base font-sans outline-none"
          />
        </div>

        {selectedContractors.length > 0 && (
          <div className="mb-4 text-sm text-text-light font-semibold">
            {selectedContractors.length} contractor(s) selected
          </div>
        )}

        <div className="flex-1 min-h-0 mb-4">
          <div className="h-[300px] overflow-y-auto border border-border rounded-md">
            {fetchLoading ? (
              <div className="p-8 text-center text-text-light">Loading contractors...</div>
            ) : filteredContractors.length === 0 ? (
              <div className="p-8 text-center text-text-light">
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
                    className={`flex items-center py-3.5 px-4 border-b border-border cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-background-light' : 'hover:bg-[#f9fafb]'}`}
                    onClick={() => handleToggleContractor(contractor.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-[18px] h-[18px] mr-4 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text mb-1">{contractor.name}</div>
                      <div className="text-sm text-text-light">({contractor.email})</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="py-3.5 px-6 text-base font-semibold border-2 border-border rounded-md bg-white text-text cursor-pointer transition-all duration-200 font-sans" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`py-3.5 px-6 text-base font-semibold border-none rounded-md bg-primary text-white cursor-pointer transition-all duration-200 font-sans ${loading || selectedContractors.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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