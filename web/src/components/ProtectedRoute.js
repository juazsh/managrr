"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-8 text-center min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-background border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-text-light">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-8 text-center min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-lg border border-red-600 max-w-[500px]">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-base leading-relaxed">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
