import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PrivateRoute from './PrivateRoute'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import NotFound from '../pages/NotFound'
import { Loader } from 'lucide-react'

// Admin management components
import AdminSweets from '../pages/admin/AdminSweets'
import AdminInventory from '../pages/admin/AdminInventory'
import AdminOrders from '../pages/admin/AdminOrders'
import AdminUsers from '../pages/admin/AdminUsers'

// User components
import SweetDetails from '../pages/SweetDetails'
import ShoppingCart from '../pages/ShoppingCart'
import Checkout from '../pages/Checkout'
import OrderHistory from '../pages/OrderHistory'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'

// Helper component to handle redirects for unauthenticated pages
const UnauthenticatedOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin w-8 h-8 text-pink-500" />
      </div>
    )
  }
  
  if (user) {
    // If user is already logged in, redirect based on role
    return user.is_admin ? 
      <Navigate to="/admin/dashboard" replace /> : 
      <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Home page handler - redirects based on auth state
const HomeHandler = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin w-8 h-8 text-pink-500" />
      </div>
    )
  }
  
  if (user) {
    return user.is_admin ? 
      <Navigate to="/admin/dashboard" replace /> : 
      <Navigate to="/dashboard" replace />
  }
  
  return <Home />
}

export default function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
          <p className="text-sm text-gray-400 mt-2">Please wait a moment</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      
      {/* Login - only accessible when NOT logged in */}
      <Route path="/login" element={
        <UnauthenticatedOnlyRoute>
          <Login />
        </UnauthenticatedOnlyRoute>
      } />
      
      {/* Register - only accessible when NOT logged in */}
      <Route path="/register" element={
        <UnauthenticatedOnlyRoute>
          <Register />
        </UnauthenticatedOnlyRoute>
      } />
      
      {/* Protected User Dashboard (for regular users) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      {/* User Shopping Routes */}
      <Route path="/sweets/:id" element={
        <PrivateRoute>
          <SweetDetails />
        </PrivateRoute>
      } />
      
      <Route path="/cart" element={
        <PrivateRoute>
          <ShoppingCart />
        </PrivateRoute>
      } />
      
      <Route path="/checkout" element={
        <PrivateRoute>
          <Checkout />
        </PrivateRoute>
      } />
      
      <Route path="/orders" element={
        <PrivateRoute>
          <OrderHistory />
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
      
      {/* Admin Routes - Only accessible to admin users */}
      
      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <Navigate to="/admin/dashboard" replace />
        </PrivateRoute>
      } />
      
      {/* Admin Dashboard (Main admin page) */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute adminOnly>
          <AdminDashboard />
        </PrivateRoute>
      } />
      
      {/* Other Admin Management Pages */}
      <Route path="/admin/sweets" element={
        <PrivateRoute adminOnly>
          <AdminSweets />
        </PrivateRoute>
      } />
      
      <Route path="/admin/inventory" element={
        <PrivateRoute adminOnly>
          <AdminInventory />
        </PrivateRoute>
      } />
      
      <Route path="/admin/orders" element={
        <PrivateRoute adminOnly>
          <AdminOrders />
        </PrivateRoute>
      } />
      
      <Route path="/admin/users" element={
        <PrivateRoute adminOnly>
          <AdminUsers />
        </PrivateRoute>
      } />
      
      {/* Fallback Routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}