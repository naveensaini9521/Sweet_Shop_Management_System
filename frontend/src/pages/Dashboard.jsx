import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { sweetsAPI } from '../api/sweets'
import SweetCard from '../components/sweets/SweetCard'
import SearchBar from '../components/sweets/SearchBar'
import { toast } from 'react-hot-toast'
import { 
  Loader, Package, TrendingUp, RefreshCw, Shield, 
  ShoppingCart, DollarSign, Award, MessageSquare, Heart, Filter 
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
    const safeSweets = Array.isArray(sweets) ? sweets : []
    const totalSweets = safeSweets.length
    const totalStock = safeSweets.reduce((sum, sweet) => sum + (sweet.quantity || 0), 0)
    const averagePrice = safeSweets.length > 0 
      ? safeSweets.reduce((sum, sweet) => sum + (sweet.price || 0), 0) / safeSweets.length
      : 0
    const outOfStock = safeSweets.filter(sweet => (sweet.quantity || 0) === 0).length
    const lowStock = safeSweets.filter(sweet => (sweet.quantity || 0) > 0 && (sweet.quantity || 0) < 10).length
    const totalValue = safeSweets.reduce((sum, sweet) => sum + (sweet.price * (sweet.quantity || 0)), 0)
    
    return { 
      totalSweets, 
      totalStock, 
      averagePrice: averagePrice.toFixed(2), 
      outOfStock, 
      lowStock,
      totalValue: totalValue.toFixed(2)
    }
  }, [sweets])

  useEffect(() => {
    fetchSweets()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchSweets, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const uniqueCategories = [...new Set(sweets.map(sweet => sweet.category))]
    setCategories(uniqueCategories)
  }, [sweets])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await sweetsAPI.getAllSweets()
      const sweetsData = Array.isArray(response?.data) ? response.data : []
      setSweets(sweetsData)
      setFilteredSweets(sweetsData)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch sweets')
      setSweets([])
      setFilteredSweets([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSweets()
    toast.success('Refreshing...')
  }

  const handleSearch = async (params) => {
    setSearchParams(params)
    try {
      if (params.name || params.category !== 'all' || params.minPrice || params.maxPrice) {
        const response = await sweetsAPI.searchSweets(params)
        setFilteredSweets(response.data)
      } else {
        setFilteredSweets(sweets)
      }
    } catch (error) {
      toast.error('Search failed')
    }
  }

  const handlePurchase = async (sweetId) => {
    try {
      await sweetsAPI.purchaseSweet(sweetId, 1)
      toast.success('Purchase successful! 🎉', { duration: 3000 })
      fetchSweets()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Purchase failed', { icon: '❌' })
    }
  }

  const handleCategoryFilter = async (category) => {
    try {
      if (category === 'all') {
        setFilteredSweets(sweets)
      } else {
        const response = await sweetsAPI.getSweetsByCategory(category)
        setFilteredSweets(response.data)
      }
      setSearchParams(prev => ({ ...prev, category }))
    } catch (error) {
      toast.error('Filter failed')
    }
  }

  const handleContact = () => {
    toast.success(
      <div className="text-left">
        <p className="font-semibold">Contact Our Sweet Team! 🍭</p>
        <p className="text-sm">Email: support@sweetshop.com</p>
        <p className="text-sm">Phone: +1 (555) SWEET-123</p>
      </div>,
      { duration: 6000 }
    )
  }

  const handleFeedback = () => {
    const feedback = prompt("Share your feedback:")
    if (feedback) {
      toast.success('Thank you for your feedback! 💖', { duration: 4000 })
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
    toast.success('Filters cleared!')
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
            <Package className="w-10 h-10 text-white" />
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600 font-medium">Loading sweet delights...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Welcome{user ? `, ${user.username}` : ''}! 🎉
              </h1>
            </div>
            <p className="text-gray-600">Discover {sweets.length} delicious treats</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {user?.is_admin && (
              <a
                href="/admin"
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </a>
            )}
            
            <button
              onClick={handleContact}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sweets', value: stats.totalSweets, icon: Package, color: 'pink' },
            { label: 'Total Stock', value: stats.totalStock, icon: ShoppingCart, color: 'amber' },
            { label: 'Avg Price', value: `$${stats.averagePrice}`, icon: DollarSign, color: 'blue' },
            { label: 'Stock Value', value: `$${stats.totalValue}`, icon: Award, color: 'green' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md">
              <div className="flex items-center">
                <div className={`p-3 bg-${stat.color}-100 rounded-xl mr-4`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              <SearchBar 
                onSearch={handleSearch} 
                categories={categories}
                initialValues={searchParams}
              />
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  searchParams.category === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    searchParams.category === category ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Showing {filteredSweets.length} of {sweets.length} sweets
          </div>
        </div>

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No sweets found</h3>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700"
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
            
            <div className="mt-8 p-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-white mb-4 md:mb-0">
                  <h4 className="font-bold text-xl mb-1">Sweet Summary</h4>
                  <p className="text-pink-100">
                    Showing {filteredSweets.length} of {sweets.length} sweets
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={handleContact}
            className="flex items-center px-5 py-3 bg-white border rounded-xl hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </button>
          <button 
            onClick={handleFeedback}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600"
          >
            <Heart className="w-4 h-4 mr-2" />
            Share Feedback
          </button>
        </div>

        {user && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>👋 Hello {user.username}! ({user.is_admin ? 'Admin' : 'Customer'})</p>
          </div>
        )}
      </div>
    </div>
  )
}