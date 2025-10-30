"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else if (user.user_type === "house_owner") {
        navigate("/dashboard")
      } else if (user.user_type === "employee") {
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
      const response = await login(formData.email, formData.password)
      const loggedInUser = response.user

      if (loggedInUser.user_type === "contractor") {
        navigate("/contractor/dashboard")
      } else if (loggedInUser.user_type === "house_owner") {
        navigate("/dashboard")
      } else if (loggedInUser.user_type === "employee") {
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
        <div className="mb-8 text-center">
          <h2 className="text-text text-[1.875rem] font-semibold mb-2 tracking-tight">Welcome back</h2>
          <p className="text-text-light text-base">Sign in to your Managrr account</p>
        </div>
        {error && <div className="bg-error-light text-error py-3.5 px-4 rounded-md mb-4 text-sm border border-error">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-text font-semibold text-sm mb-2">Email Address</label>
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
            <div className="flex justify-between items-center mb-2">
              <label className="text-text font-semibold text-sm">Password</label>
              <Link to="/forgot-password" className="text-text-light text-sm no-underline font-medium transition-colors duration-200 hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading}
            />
          </div>
          <button type="submit" className={`py-3.5 border-none rounded-md text-base font-semibold cursor-pointer mt-2 transition-all duration-200 ${isLoading ? 'bg-text-light cursor-not-allowed opacity-60' : 'bg-black text-white hover:-translate-y-0.5 hover:shadow-lg'}`} disabled={isLoading}>
            {isLoading ? "Processing..." : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-6 text-text-light text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-text no-underline font-semibold transition-colors duration-200 hover:text-primary">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login