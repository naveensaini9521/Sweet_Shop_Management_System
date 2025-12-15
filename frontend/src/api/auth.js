import api from './axios'

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/profile')
      return { authenticated: true, user: response.data }
    } catch (error) {
      return { authenticated: false, error: error.message }
    }
  }
}