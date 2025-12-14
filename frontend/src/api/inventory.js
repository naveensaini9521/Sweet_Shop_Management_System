// frontend/src/api/inventory.js
import api from './axios'

export const inventoryAPI = {
  // Get low stock items (Admin only)
  getLowStock: (threshold = 10) => api.get(`/inventory/low-stock?threshold=${threshold}`),
  
  // Get out of stock items (Admin only)
  getOutOfStock: () => api.get('/inventory/out-of-stock'),
  
  // Get inventory stats (Admin only)
  getInventoryStats: () => api.get('/inventory/stats'),
  
  // Bulk restock (Admin only)
  bulkRestock: (restockData) => api.post('/inventory/bulk-restock', restockData),
}