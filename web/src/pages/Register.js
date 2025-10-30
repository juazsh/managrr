"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "house_owner",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else {
        navigate("/dashboard")
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await register(formData.name, formData.email, formData.password, formData.userType)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
          <div className="w-16 h-16 rounded-full bg-success text-white flex items-center justify-center text-[2rem] mx-auto mb-6">✓</div>
          <h2 className="text-text text-[1.875rem] font-semibold mb-2 tracking-tight text-center">Registration Successful!</h2>
          <p className="text-text-light text-center text-base mt-4">
            Please check your email to verify your account. You'll be redirected to login shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
        <div className="mb-8 text-center">
          <h2 className="text-text text-[1.875rem] font-semibold mb-2 tracking-tight">Create an account</h2>
          <p className="text-text-light text-base">Get started with Managrr</p>
        </div>
        {error && <div className="bg-error-light text-error py-3.5 px-4 rounded-md mb-4 text-sm border border-error">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password (min. 8 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">I am a</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              required
              disabled={isLoading}
            >
              <option value="house_owner">House Owner</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>
          <button type="submit" className={`py-3.5 border-none rounded-md text-base font-semibold cursor-pointer mt-2 transition-all duration-200 ${isLoading ? 'bg-text-light cursor-not-allowed opacity-60' : 'bg-black text-white hover:-translate-y-0.5 hover:shadow-lg'}`} disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-6 text-text-light text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-text no-underline font-semibold transition-colors duration-200 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register