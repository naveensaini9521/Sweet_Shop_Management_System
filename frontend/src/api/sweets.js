import api from './axios';

const sweetsAPI = {
  // Get all sweets
  getAllSweets: async () => {
    return await api.get('/sweets');
  },

  // Get sweets by category
  getSweetsByCategory: async (category) => {
    return await api.get(`/sweets/search?category=${category}`);
  },

  // Search sweets with filters
  searchSweets: async (params) => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('min_price', params.minPrice);
    if (params.maxPrice) queryParams.append('max_price', params.maxPrice);
    
    return await api.get(`/sweets/search?${queryParams.toString()}`);
  },

  // Add a new sweet (Admin only) - FIXED
  createSweet: async (sweetData) => {
    return await api.post('/sweets', sweetData);
  },

  // Update a sweet (Admin only) - FIXED
  updateSweet: async (sweetId, updateData) => {
    return await api.put(`/sweets/${sweetId}`, updateData);
  },

  // Delete a sweet (Admin only) - FIXED
  deleteSweet: async (sweetId) => {
    return await api.delete(`/sweets/${sweetId}`);
  },

  // Purchase a sweet - FIXED
  purchaseSweet: async (sweetId, quantity = 1) => {
    return await api.post(`/sweets/${sweetId}/purchase`, { quantity });
  },

  // Restock a sweet (Admin only) - FIXED
  restockSweet: async (sweetId, quantity) => {
    return await api.post(`/sweets/${sweetId}/restock`, { quantity });
  },

  // Get all categories
  getCategories: async () => {
    return await api.get('/sweets/categories/list');
  }
};

export { sweetsAPI };