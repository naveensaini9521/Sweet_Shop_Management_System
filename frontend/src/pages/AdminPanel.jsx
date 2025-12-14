// frontend/src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext' // Add this import
import { sweetsAPI } from "../api/sweets"
import { inventoryAPI } from "../api/inventory"
import SweetForm from '../components/admin/SweetForm'
import toast from 'react-hot-toast'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Loader, 
  Users,
  AlertCircle,
  Eye
} from 'lucide-react'

export default function AdminPanel() {
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSweet, setEditingSweet] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState({})
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  })
  
  const { user } = useAuth() // Get user from AuthContext

  useEffect(() => {
    if (user?.is_admin) {
      fetchSweets()
    }
  }, [user])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const data = await sweetsAPI.getAllSweets()
      setSweets(data)
      calculateStats(data)
    } catch (error) {
      console.error('Error fetching sweets:', error)
      toast.error('Failed to fetch sweets')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (sweetsData) => {
    const totalProducts = sweetsData.length
    const totalValue = sweetsData.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0)
    const lowStock = sweetsData.filter(s => s.quantity > 0 && s.quantity < 10).length
    const outOfStock = sweetsData.filter(s => s.quantity === 0).length
    
    setStats({
      totalProducts,
      totalValue,
      lowStock,
      outOfStock
    })
  }

  const handleCreateSweet = async (sweetData) => {
    try {
      await sweetsAPI.createSweet(sweetData)
      toast.success('Sweet created successfully!')
      setShowForm(false)
      await fetchSweets()
    } catch (error) {
      console.error('Error creating sweet:', error)
      toast.error(error.response?.data?.detail || 'Failed to create sweet')
    }
  }

  const handleUpdateSweet = async (id, sweetData) => {
    try {
      // Remove id from update data
      const { id: _, ...updateData } = sweetData
      await sweetsAPI.updateSweet(id, updateData)
      toast.success('Sweet updated successfully!')
      setEditingSweet(null)
      await fetchSweets()
    } catch (error) {
      console.error('Error updating sweet:', error)
      toast.error(error.response?.data?.detail || 'Failed to update sweet')
    }
  }

  const handleDeleteSweet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) return
    
    try {
      await sweetsAPI.deleteSweet(id)
      toast.success('Sweet deleted successfully!')
      await fetchSweets()
    } catch (error) {
      console.error('Error deleting sweet:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete sweet')
    }
  }

  const handleRestock = async (sweetId) => {
    const quantity = restockQuantity[sweetId] || 10
    if (quantity <= 0) {
      toast.error('Quantity must be positive')
      return
    }

    try {
      await inventoryAPI.restockSweet(sweetId, quantity)
      toast.success(`Restocked ${quantity} items!`)
      setRestockQuantity({ ...restockQuantity, [sweetId]: '' })
      await fetchSweets()
    } catch (error) {
      console.error('Error restocking:', error)
      toast.error(error.response?.data?.detail || 'Failed to restock')
    }
  }

  const handlePurchase = async (sweetId) => {
    try {
      await inventoryAPI.purchaseSweet(sweetId, 1)
      toast.success('Purchase recorded!')
      await fetchSweets()
    } catch (error) {
      console.error('Error purchasing:', error)
      toast.error(error.response?.data?.detail || 'Failed to record purchase')
    }
  }

  const handleViewSweet = (sweet) => {
    // Navigate to sweet detail view or show modal
    toast.success(`Viewing ${sweet.name}`, {
      icon: '👀',
      duration: 2000
    })
  }

  // Check if user is admin
  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.username}! Manage your sweet inventory here.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Sweet
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-xl mr-4">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-xl mr-4">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Stock Value</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-800">{stats.lowStock}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-800">{stats.outOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sweets Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Sweet Inventory</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage all your sweet products. Total: {sweets.length} items
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">Name</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">Category</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">Price</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sweets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 px-6 text-center text-gray-500">
                      No sweets found. Add your first sweet to get started!
                    </td>
                  </tr>
                ) : (
                  sweets.map((sweet) => (
                    <tr key={sweet.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">{sweet.name}</p>
                          {sweet.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {sweet.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                          {sweet.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-800">
                          ${sweet.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold text-lg ${
                            sweet.quantity === 0 ? 'text-red-600' :
                            sweet.quantity < 10 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {sweet.quantity}
                          </span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={restockQuantity[sweet.id] || ''}
                              onChange={(e) => setRestockQuantity({
                                ...restockQuantity,
                                [sweet.id]: parseInt(e.target.value) || ''
                              })}
                              className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                              placeholder="Qty"
                            />
                            <button
                              onClick={() => handleRestock(sweet.id)}
                              className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition font-medium"
                            >
                              Restock
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewSweet(sweet)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePurchase(sweet.id)}
                            disabled={sweet.quantity === 0}
                            className={`p-2 rounded-lg transition ${
                              sweet.quantity === 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title="Purchase"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSweet(sweet)}
                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSweet(sweet.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Showing {sweets.length} of {sweets.length} sweets
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  In Stock
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  Low Stock
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Out of Stock
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-pink-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Sweet
            </button>
            <button
              onClick={fetchSweets}
              className="bg-white text-pink-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center"
            >
              <Loader className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
            <button
              onClick={() => toast.info('Export feature coming soon!')}
              className="bg-white text-pink-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Sweet Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <SweetForm
              onSubmit={handleCreateSweet}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingSweet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <SweetForm
              sweet={editingSweet}
              onSubmit={(data) => handleUpdateSweet(editingSweet.id, data)}
              onCancel={() => setEditingSweet(null)}
              isEditing={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}