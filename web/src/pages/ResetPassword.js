"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import api from "../services/api"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (!tokenFromUrl) {
      setError("Invalid or missing reset token")
    } else {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!token) {
      setError("Invalid reset token")
      return
    }

    setIsLoading(true)

    try {
      await api.post("/auth/reset-password", {
        token: token,
        new_password: formData.newPassword,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
          <div className="w-[60px] h-[60px] rounded-full bg-success-light text-success flex items-center justify-center text-[2rem] font-bold mx-auto mb-6">✓</div>
          <h2 className="text-success text-[1.875rem] font-semibold mb-4 tracking-tight text-center">Password Reset Successful!</h2>
          <p className="text-text text-base text-center mb-4 leading-relaxed">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <p className="text-text-light text-sm text-center mb-6 leading-normal">
            Redirecting to login page...
          </p>
          <Link to="/login" className="block bg-black text-white py-3.5 px-4 border-none rounded-md text-base font-semibold cursor-pointer text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            Go to Login Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
        <div className="mb-8 text-center">
          <h2 className="text-text text-[1.875rem] font-semibold mb-2 tracking-tight">Reset your password</h2>
          <p className="text-text-light text-base">
            Enter your new password below
          </p>
        </div>
        {error && <div className="bg-error-light text-error py-3.5 px-4 rounded-md mb-4 text-sm border border-error">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password (min. 8 characters)"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading || !token}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading || !token}
            />
          </div>
          <button
            type="submit"
            className={`py-3.5 border-none rounded-md text-base font-semibold cursor-pointer mt-2 transition-all duration-200 ${(isLoading || !token) ? 'bg-text-light cursor-not-allowed opacity-60' : 'bg-black text-white hover:-translate-y-0.5 hover:shadow-lg'}`}
            disabled={isLoading || !token}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center mt-6 text-text-light text-sm">
          Remember your password?{" "}
          <Link to="/login" className="text-text no-underline font-semibold transition-colors duration-200 hover:text-primary">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
