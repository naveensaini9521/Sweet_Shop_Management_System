import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ShoppingBag, User, Settings, Shield, LogOut } from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const location = useLocation()
  
  const isAdmin = user?.is_admin
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="font-bold text-xl text-pink-600">
              Sweet Shop 🍬
            </Link>
            
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.username}</span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Switch between user and admin view */}
                {isAdmin ? (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    User View
                  </Link>
                ) : isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
                
                {/* Logout button */}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            )}
            
            {!user && (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}