"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
    setMobileMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return "/"
    if (user.user_type === "contractor") return "/contractor/dashboard"
    return "/dashboard"
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={getDashboardLink()} className="navbar-brand">
          <span className="navbar-logo">managrr</span>
        </Link>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          {isAuthenticated ? (
            <>
              <span className="navbar-username">{user?.name}</span>
              {user?.user_type === "contractor" && (
                <Link to="/contractor/employees" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                  Employees
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-button-link" onClick={() => setMobileMenuOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
