import axios from 'axios'

// Determine base URL based on environment
const isProduction = process.env.NODE_ENV === 'production'
const API_BASE_URL = isProduction 
  ? '/api'  // Relative path when served from FastAPI
  : 'http://localhost:8000/api'  // Direct to FastAPI in development

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('refresh_token')
      
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    })
    
    return Promise.reject(error)
  }
)

// Add a helper for checking API connection
api.checkConnection = async () => {
  try {
    const response = await api.get('/health')
    return { connected: true, data: response.data }
  } catch (error) {
    return { connected: false, error: error.message }
  }
}

export default api