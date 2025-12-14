import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { sweetsAPI } from '../api/sweets'
import { inventoryAPI } from '../api/inventory'
import SweetCard from '../components/sweets/SweetCard'
import SearchBar from '../components/sweets/SearchBar'
import { toast } from 'react-hot-toast'
import { 
  Loader, Package, TrendingUp, BarChart3, Users, MessageSquare, 
  ShoppingBag, Star, Filter, RefreshCw, Zap, Award, Heart,
  ShoppingCart, Tag, Clock, Shield, DollarSign  // Added DollarSign
} from 'lucide-react'

export default function Dashboard() {
  const [sweets, setSweets] = useState([])
  const [filteredSweets, setFilteredSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: 'all',
    minPrice: '',
    maxPrice: ''
  })
  
  const { user } = useAuth()

  // Calculate memoized statistics
  const stats = useMemo(() => {
    // Ensure sweets is always an array
    const safeSweets = Array.isArray(sweets) ? sweets : []
    
    const totalSweets = safeSweets.length
    const totalStock = safeSweets.reduce((sum, sweet) => sum + (sweet.quantity || 0), 0)
    const averagePrice = safeSweets.length > 0 
      ? safeSweets.reduce((sum, sweet) => sum + (sweet.price || 0), 0) / safeSweets.length
      : 0
    const outOfStock = safeSweets.filter(sweet => (sweet.quantity || 0) === 0).length
    const lowStock = safeSweets.filter(sweet => (sweet.quantity || 0) > 0 && (sweet.quantity || 0) < 10).length
    const totalValue = safeSweets.reduce((sum, sweet) => sum + (sweet.price * (sweet.quantity || 0)), 0)
    
    // Find best selling
    const bestSelling = safeSweets.length > 0 
      ? safeSweets.reduce((prev, current) => 
          ((prev.price || 0) * (prev.quantity || 0)) > ((current.price || 0) * (current.quantity || 0)) ? prev : current
        )?.name || 'None'
      : 'None'
    
    return { 
      totalSweets, 
      totalStock, 
      averagePrice, 
      outOfStock, 
      lowStock,
      totalValue,
      bestSelling 
    }
  }, [sweets])

  useEffect(() => {
    fetchSweets()
  }, [])

  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = [...new Set(sweets.map(sweet => sweet.category))]
    setCategories(uniqueCategories)
  }, [sweets])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await sweetsAPI.getAllSweets()
      
      // Ensure we have an array
      const sweetsData = Array.isArray(response?.data) ? response.data : []
      
      setSweets(sweetsData)
      setFilteredSweets(sweetsData)
      
      console.log('Fetched sweets:', sweetsData) // Debug log
      
    } catch (error) {
      console.error('Error fetching sweets:', error)
      toast.error(error.response?.data?.detail || 'Failed to fetch sweets')
      // Set empty arrays on error
      setSweets([])
      setFilteredSweets([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSweets()
    toast.success('Refreshing sweets...')
  }

  const handleSearch = async (params) => {
    setSearchParams(params)
    
    try {
      if (params.name || params.category !== 'all' || params.minPrice || params.maxPrice) {
        // Use search API
        const searchData = await sweetsAPI.searchSweets(params)
        setFilteredSweets(searchData)
      } else {
        // Show all sweets
        setFilteredSweets(sweets)
      }
    } catch (error) {
      console.error('Error searching sweets:', error)
      toast.error('Failed to search sweets')
    }
  }

  const handlePurchase = async (sweetId) => {
    try {
      const result = await inventoryAPI.purchaseSweet(sweetId, 1)
      toast.success(
        <div className="flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2" />
          {result.message || 'Purchase successful!'}
        </div>,
        { icon: '🎉', duration: 3000 }
      )
      // Refresh the sweets list to update quantities
      await fetchSweets()
    } catch (error) {
      console.error('Error purchasing:', error)
      toast.error(
        error.response?.data?.detail || 'Failed to purchase. Please try again.',
        { icon: '❌', duration: 4000 }
      )
    }
  }

  const handleCategoryFilter = async (category) => {
    try {
      if (category === 'all') {
        setFilteredSweets(sweets)
      } else {
        const data = await sweetsAPI.getSweetsByCategory(category)
        setFilteredSweets(data)
      }
      setSearchParams(prev => ({ ...prev, category }))
    } catch (error) {
      console.error('Error filtering by category:', error)
      toast.error('Failed to filter by category')
    }
  }

  const handleContact = () => {
    toast.success(
      <div className="text-left">
        <p className="font-semibold">Contact Our Sweet Team! 🍭</p>
        <p className="text-sm text-gray-600">Email: support@sweetshop.com</p>
        <p className="text-sm text-gray-600">Phone: +1 (555) SWEET-123</p>
        <p className="text-sm text-gray-600">Hours: 9 AM - 9 PM</p>
      </div>,
      { duration: 6000 }
    )
  }

  const handleFeedback = () => {
    const feedback = prompt("Share your feedback about our sweets:")
    if (feedback) {
      // In a real app, you would send this to your backend
      toast.success(
        <div className="flex items-center">
          <Heart className="w-4 h-4 mr-2 text-pink-500" />
          Thank you for your valuable feedback! 💖
        </div>,
        { duration: 4000 }
      )
    }
  }

  const handleClearFilters = () => {
    setSearchParams({
      name: '',
      category: 'all',
      minPrice: '',
      maxPrice: ''
    })
    setFilteredSweets(sweets)
    toast.success('Filters cleared!', { icon: '✨' })
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
            <Package className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
            <Star className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600 font-medium">Loading sweet delights...</p>
        <p className="text-sm text-gray-400 mt-2">Preparing your dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Welcome Message */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Welcome to Sweet Shop{user ? `, ${user.username}` : ''}! 🎉
              </h1>
            </div>
            <p className="text-gray-600">
              Discover {sweets.length} delicious treats waiting for you
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm hover:shadow"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {user?.is_admin && (
              <a
                href="/admin"
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-sm hover:shadow"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </a>
            )}
            
            <button
              onClick={handleContact}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-xl mr-4">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sweets</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSweets}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Available for purchase
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-xl mr-4">
                <ShoppingCart className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStock}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-600">
              {stats.outOfStock > 0 
                ? `${stats.outOfStock} out of stock` 
                : 'All items available'}
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.averagePrice.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              From ${sweets.length > 0 ? Math.min(...sweets.map(s => s.price || 0)).toFixed(2) : '0.00'}
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Total inventory value
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              <SearchBar 
                onSearch={handleSearch} 
                categories={categories}
                initialValues={searchParams}
              />
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition"
              >
                Clear Filters
              </button>
            </div>
            
            {/* Quick Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  searchParams.category === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    searchParams.category === category
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                >
                  {category}
                </button>
              ))}
              {categories.length > 6 && (
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  +{categories.length - 6} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Showing {filteredSweets.length} of {sweets.length} sweets
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              In Stock ({sweets.filter(s => s.quantity > 0).length})
            </span>
            <span className="flex items-center text-sm">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              Low Stock ({stats.lowStock})
            </span>
            <span className="flex items-center text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Out of Stock ({stats.outOfStock})
            </span>
          </div>
        </div>

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mx-auto flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No sweets found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Try adjusting your search criteria or browse all our delicious treats
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition shadow-sm"
            >
              Show All Sweets
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSweets.map((sweet) => (
                <SweetCard
                  key={sweet.id}
                  sweet={sweet}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
            
            {/* Summary Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-white mb-4 md:mb-0">
                  <h4 className="font-bold text-xl mb-1">Sweet Summary</h4>
                  <p className="text-pink-100">
                    Showing {filteredSweets.length} of {sweets.length} sweets
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {sweets.filter(s => s.quantity > 0).length}
                    </div>
                    <div className="text-xs text-pink-100">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats.lowStock}
                    </div>
                    <div className="text-xs text-pink-100">Low Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stats.outOfStock}
                    </div>
                    <div className="text-xs text-pink-100">Out of Stock</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={handleContact}
            className="flex items-center px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Need Help? Contact Support
          </button>
          <button 
            onClick={handleFeedback}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition shadow-sm"
          >
            <Heart className="w-4 h-4 mr-2" />
            Share Feedback
          </button>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Back to Top
          </button>
        </div>

        {/* User Greeting Footer */}
        {user && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>👋 Hello {user.username}! You're currently viewing as a {user.is_admin ? 'Admin' : 'Customer'}</p>
            <p className="mt-1">Enjoy shopping for sweets! 🍬</p>
          </div>
        )}
      </div>
    </div>
  )
}