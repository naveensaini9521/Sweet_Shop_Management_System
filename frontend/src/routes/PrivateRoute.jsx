// frontend/src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader, Shield } from 'lucide-react'
import { useEffect, useState } from 'react' // Add useEffect

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth() // Remove isAuthenticated
  const location = useLocation()
  const [authChecked, setAuthChecked] = useState(false)

  // Add a small delay to prevent immediate redirect loops
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setAuthChecked(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading])

  // Show loading while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
              <Loader className="animate-spin w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs text-white">🍬</span>
            </div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading sweet shop...</p>
          <p className="text-sm text-gray-400 mt-2">Verifying your session</p>
        </div>
      </div>
    )
  }

  // Check for authentication token instead of isAuthenticated state
  const hasToken = localStorage.getItem('access_token')
  
  // Redirect to login if no token exists
  if (!hasToken) {
    console.log('No token found, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If token exists but user data is still loading, show loading
  if (!user && hasToken) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader className="animate-spin w-8 h-8 text-pink-500" />
      </div>
    )
  }

  // Check admin access - only proceed if we have user data
  if (adminOnly && user && !user.is_admin) {
    console.log('Admin access denied for user:', user.email)
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied 🔒</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this page.
          </p>
          <div className="space-y-3">
            <a
              href="/dashboard"
              className="block px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition font-medium"
            >
              Go to User Dashboard
            </a>
            <a
              href="/"
              className="block px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Return to Home
            </a>
            <p className="text-sm text-gray-500 mt-4 pt-4 border-t">
              {user?.email && `Logged in as: ${user.email}`}
              <br />
              <span className="text-xs">Contact an administrator for access.</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If we have a token but no user data yet, show loading
  if (hasToken && !user) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <Loader className="animate-spin w-8 h-8 text-pink-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  // All checks passed, render children
  return children
}