import api from './axios'

export const sweetsAPI = {
  // Create sweet (Admin only)
  createSweet: (sweetData) => api.post('/sweets', sweetData),
  
  // Get all sweets
  getAllSweets: () => api.get('/sweets'),
  
  // Search sweets
  searchSweets: (params) => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('min_price', params.minPrice);
    if (params.maxPrice) queryParams.append('max_price', params.maxPrice);
    
    return api.get(`/sweets/search?${queryParams}`);
  },
  
  // Get sweet by ID
  getSweetById: (id) => api.get(`/sweets/${id}`),
  
  // Update sweet (Admin only)
  updateSweet: (id, sweetData) => api.put(`/sweets/${id}`, sweetData),
  
  // Delete sweet (Admin only)
  deleteSweet: (id) => api.delete(`/sweets/${id}`),
  
  // Purchase sweet
  purchaseSweet: (id, quantity = 1) => 
    api.post(`/sweets/${id}/purchase`, { quantity }),
  
  // Restock sweet (Admin only)
  restockSweet: (id, quantity = 10) => 
    api.post(`/sweets/${id}/restock`, { quantity }),
  
  // Get sweets by category
  getSweetsByCategory: (category) => 
    api.get(`/sweets/search?category=${category}`),
  
  // Get all categories
  getCategories: () => api.get('/sweets/categories/list'),
}