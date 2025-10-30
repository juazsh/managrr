"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await api.post("/auth/forgot-password", { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
          <div className="w-[60px] h-[60px] rounded-full bg-success-light text-success flex items-center justify-center text-[2rem] font-bold mx-auto mb-6">✓</div>
          <h2 className="text-success text-[1.875rem] font-semibold mb-4 tracking-tight text-center">Check your email</h2>
          <p className="text-text text-base text-center mb-4 leading-relaxed">
            If the email exists in our system, a password reset link has been sent to <strong>{email}</strong>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-text-light text-sm text-center mb-6 leading-normal">
            The link will expire in 1 hour. If you don't see the email, check your spam folder.
          </p>
          <Link to="/login" className="block bg-black text-white py-3.5 px-4 border-none rounded-md text-base font-semibold cursor-pointer text-center no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background font-sans p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[440px] border border-border-light">
        <div className="mb-8 text-center">
          <h2 className="text-text text-[1.875rem] font-semibold mb-2 tracking-tight">Forgot your password?</h2>
          <p className="text-text-light text-base">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        {error && <div className="bg-error-light text-error py-3.5 px-4 rounded-md mb-4 text-sm border border-error">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-3.5 px-4 border border-border rounded-md text-base font-sans bg-[#F9FAFB] transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`py-3.5 border-none rounded-md text-base font-semibold cursor-pointer mt-2 transition-all duration-200 ${isLoading ? 'bg-text-light cursor-not-allowed opacity-60' : 'bg-black text-white hover:-translate-y-0.5 hover:shadow-lg'}`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword