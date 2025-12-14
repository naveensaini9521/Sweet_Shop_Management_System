// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { sweetsAPI } from "../../api/sweets";
import { inventoryAPI } from "../../api/inventory";
import { authAPI } from '../../api/auth'

import { toast } from 'react-hot-toast'
import { 
  Package, Plus, Edit, Trash2, RefreshCw, 
  ShoppingBag, DollarSign, TrendingUp, BarChart3,
  Shield, Users, AlertTriangle, CheckCircle,
  Search, Filter, ArrowUpDown, Download, Upload,
  ChevronLeft, ChevronRight
} from 'lucide-react'

export { sweetsAPI, inventoryAPI, authAPI }

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [sweets, setSweets] = useState([])
  const [filteredSweets, setFilteredSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSweet, setSelectedSweet] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    image_url: '',
    tags: []
  })

  useEffect(() => {
    if (user?.is_admin) {
      fetchSweets()
      fetchStats()
    }
  }, [user])

  useEffect(() => {
    filterSweets()
  }, [sweets, searchTerm, categoryFilter])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await sweetsAPI.getAllSweets()
      setSweets(response.data)
      setFilteredSweets(response.data)
    } catch (error) {
      toast.error('Failed to fetch sweets')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getInventoryStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filterSweets = () => {
    let filtered = sweets
    
    if (searchTerm) {
      filtered = filtered.filter(sweet => 
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sweet.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sweet => sweet.category === categoryFilter)
    }
    
    setFilteredSweets(filtered)
    setCurrentPage(1)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const sweetData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      }
      
      await sweetsAPI.createSweet(sweetData)
      toast.success('Sweet created successfully! 🍬')
      setShowCreateModal(false)
      resetForm()
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create sweet')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const updateData = {}
      if (formData.name) updateData.name = formData.name
      if (formData.category) updateData.category = formData.category
      if (formData.price) updateData.price = parseFloat(formData.price)
      if (formData.quantity) updateData.quantity = parseInt(formData.quantity)
      if (formData.description !== undefined) updateData.description = formData.description
      if (formData.image_url !== undefined) updateData.image_url = formData.image_url
      if (formData.tags) updateData.tags = formData.tags
      
      await sweetsAPI.updateSweet(selectedSweet.id, updateData)
      toast.success('Sweet updated successfully! ✨')
      setShowEditModal(false)
      resetForm()
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update sweet')
    }
  }

  const handleDelete = async (sweetId) => {
    if (!window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) return
    
    try {
      await sweetsAPI.deleteSweet(sweetId)
      toast.success('Sweet deleted successfully! 🗑️')
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete sweet')
    }
  }

  const handleRestock = async (sweetId, currentQuantity) => {
    const quantity = prompt(`Enter quantity to restock (Current: ${currentQuantity}):`, '10')
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      toast.error('Invalid quantity entered')
      return
    }
    
    try {
      await sweetsAPI.restockSweet(sweetId, parseInt(quantity))
      toast.success(`Restocked ${quantity} items! 📦`)
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to restock')
    }
  }

  const handleQuickRestock = async (sweetId) => {
    try {
      await sweetsAPI.restockSweet(sweetId, 10)
      toast.success('Quick restocked 10 items! ⚡')
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to restock')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      image_url: '',
      tags: []
    })
    setSelectedSweet(null)
  }

  const handleEditClick = (sweet) => {
    setSelectedSweet(sweet)
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      description: sweet.description || '',
      image_url: sweet.image_url || '',
      tags: sweet.tags || []
    })
    setShowEditModal(true)
  }

  const handleBulkRestock = async () => {
    const lowStockSweets = sweets.filter(s => s.quantity <= 5)
    if (lowStockSweets.length === 0) {
      toast.error('No low stock items found')
      return
    }
    
    const restockData = {}
    lowStockSweets.forEach(sweet => {
      restockData[sweet.id] = 20 // Restock 20 each
    })
    
    try {
      await inventoryAPI.bulkRestock(restockData)
      toast.success(`Restocked ${lowStockSweets.length} items in bulk! 🚀`)
      fetchSweets()
      fetchStats()
    } catch (error) {
      toast.error('Failed to bulk restock')
    }
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity <= 10) return { text: 'Low Stock', color: 'bg-amber-100 text-amber-800' }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  // Pagination
  const totalPages = Math.ceil(filteredSweets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSweets = filteredSweets.slice(startIndex, endIndex)

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied 🔒</h2>
          <p className="text-gray-600 mb-6">Admin privileges required to access this dashboard.</p>
          <button
            onClick={logout}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
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
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username} 👑</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Sweet
            </button>
            <button
              onClick={handleBulkRestock}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition shadow"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Bulk Restock
            </button>
            <button
              onClick={fetchSweets}
              className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Items</p>
                  <p className="text-2xl font-bold">{stats.total_items}</p>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-80">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Active products
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Stock</p>
                  <p className="text-2xl font-bold">{stats.total_stock}</p>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-80">
                Items available
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Value</p>
                  <p className="text-2xl font-bold">${stats.total_value.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-80">
                Inventory value
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.low_stock}</p>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-80">
                Needs attention
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sweets by name or description..."
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(sweets.map(s => s.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {currentSweets.length} of {filteredSweets.length} sweets
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                In Stock ({sweets.filter(s => s.quantity > 10).length})
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                Low Stock ({sweets.filter(s => s.quantity > 0 && s.quantity <= 10).length})
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Out of Stock ({sweets.filter(s => s.quantity === 0).length})
              </span>
            </div>
          </div>
        </div>

        {/* Sweets Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSweets.map((sweet) => {
                  const stockStatus = getStockStatus(sweet.quantity)
                  return (
                    <tr key={sweet.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {sweet.image_url ? (
                            <img 
                              src={sweet.image_url} 
                              alt={sweet.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center mr-3">
                              <Package className="w-5 h-5 text-pink-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{sweet.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {sweet.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {sweet.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">${sweet.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`font-bold ${sweet.quantity === 0 ? 'text-red-600' : sweet.quantity <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                            {sweet.quantity}
                          </span>
                          {sweet.quantity > 0 && sweet.quantity <= 10 && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(sweet)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickRestock(sweet.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Quick Restock"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRestock(sweet.id, sweet.quantity)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Custom Restock"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sweet.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {currentSweets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No sweets found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria or add new sweets</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Add Your First Sweet
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 border text-sm rounded-md ${
                        currentPage === i + 1
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Sweet</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe this sweet treat..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
                  >
                    Create Sweet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSweet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Sweet</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition"
                  >
                    Update Sweet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}