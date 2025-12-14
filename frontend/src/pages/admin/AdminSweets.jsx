// frontend/src/pages/admin/AdminSweets.jsx
import { useState, useEffect } from 'react'
import { sweetsAPI } from '../../api/sweets'
import { toast } from 'react-hot-toast'
import { 
  Package, Plus, Edit, Trash2, Search, Filter,
  AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react'

export default function AdminSweets() {
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchSweets()
  }, [])
  
  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await sweetsAPI.getAllSweets()
      setSweets(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch sweets')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Sweets</h2>
          <p className="text-gray-600">Add, edit, or delete sweet products</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add New Sweet
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        ) : sweets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sweets.map((sweet) => (
                  <tr key={sweet.id} className="border-t">
                    <td className="p-3">{sweet.name}</td>
                    <td className="p-3">{sweet.category}</td>
                    <td className="p-3">${sweet.price}</td>
                    <td className="p-3">{sweet.quantity}</td>
                    <td className="p-3">
                      <button className="text-blue-600 mr-3">Edit</button>
                      <button className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sweets found. Add your first sweet!</p>
          </div>
        )}
      </div>
    </div>
  )
}