import api from './axios';

const inventoryAPI = {
  getInventoryStats: async () => {
    return await api.get('/inventory/stats');
  },

  // Get low stock items (Admin only)
  getLowStockItems: async (threshold = 10) => {
    return await api.get(`/inventory/low-stock?threshold=${threshold}`);
  },

  // Get out of stock items (Admin only)
  getOutOfStockItems: async () => {
    return await api.get('/inventory/out-of-stock');
  },

  // Bulk restock (Admin only)
  bulkRestock: async (restockData) => {
    return await api.post('/inventory/bulk-restock', restockData);
  }
};

export { inventoryAPI };