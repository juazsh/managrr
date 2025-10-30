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
    <nav className="bg-white py-4 border-b border-border-light sticky top-0 z-[100] shadow-sm">
      <div className="max-w-[1200px] mx-auto px-8 md:px-8 flex justify-between items-center relative">
        <Link to={getDashboardLink()} className="no-underline">
          <span className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Managrr</span>
        </Link>

        <button
          className="hidden max-[767px]:block bg-transparent border-none cursor-pointer p-2 text-[#1a1a1a] text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>

        <div className={`flex items-center gap-8 max-[767px]:absolute max-[767px]:top-full max-[767px]:right-0 max-[767px]:left-0 max-[767px]:bg-white max-[767px]:flex-col max-[767px]:p-8 max-[767px]:border-t max-[767px]:border-border-light max-[767px]:shadow-lg ${mobileMenuOpen ? 'max-[767px]:flex' : 'max-[767px]:hidden'}`}>
          {isAuthenticated ? (
            <>
              <span className="text-text-light text-base font-medium max-[767px]:w-full max-[767px]:text-center max-[767px]:py-2">{user?.name}</span>
              {user?.user_type === "contractor" && (
                <Link to="/contractor/employees" className="text-[#1a1a1a] no-underline text-base font-medium transition-colors duration-200 hover:text-primary max-[767px]:w-full max-[767px]:text-center max-[767px]:py-2" onClick={() => setMobileMenuOpen(false)}>
                  Employees
                </Link>
              )}
              <button onClick={handleLogout} className="bg-primary text-white border-none py-2.5 px-5 rounded-full cursor-pointer text-sm font-semibold transition-all duration-200 shadow-sm hover:bg-primary-dark hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] max-[767px]:w-full max-[767px]:text-center">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#1a1a1a] no-underline text-base font-medium transition-colors duration-200 hover:text-primary max-[767px]:w-full max-[767px]:text-center max-[767px]:py-2" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="bg-primary text-white no-underline py-2.5 px-5 rounded-full text-sm font-semibold inline-block transition-all duration-200 shadow-sm hover:bg-primary-dark hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:text-white max-[767px]:w-full max-[767px]:text-center" onClick={() => setMobileMenuOpen(false)}>
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
