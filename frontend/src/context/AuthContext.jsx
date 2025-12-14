import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../api/auth'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          const response = await authAPI.getProfile()
          setUser(response.data)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access_token, refresh_token, user } = response.data
      
      // Store tokens and user data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Update state
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { access_token, refresh_token, user } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  const isAdmin = () => {
    return user?.is_admin === true || user?.role === 'admin'
    }

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }))
  }

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      checkAuth,
      updateUserProfile,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  )
}