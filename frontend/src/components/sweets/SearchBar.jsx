import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

export default function SearchBar({ onSearch, sweets = [] }) {
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: 'all',
    minPrice: '',
    maxPrice: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  // Safely extract unique categories - IMPROVED VERSION
  const categories = ['all', ...new Set(
    (Array.isArray(sweets) ? sweets : [])
      .filter(sweet => sweet && typeof sweet === 'object' && sweet.category)
      .map(sweet => sweet.category)
      .filter(category => typeof category === 'string' && category.trim() !== '')
  )]

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedParams = {
      ...searchParams,
      [name]: value
    }
    setSearchParams(updatedParams)
    onSearch && onSearch(updatedParams)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch && onSearch(searchParams)
  }

  const handleReset = () => {
    const resetParams = {
      name: '',
      category: 'all',
      minPrice: '',
      maxPrice: ''
    }
    setSearchParams(resetParams)
    onSearch && onSearch(resetParams)
  }

  const handleCategorySelect = (category) => {
    const updatedParams = {
      ...searchParams,
      category
    }
    setSearchParams(updatedParams)
    setShowCategories(false)
    onSearch && onSearch(updatedParams)
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              value={searchParams.name}
              onChange={handleChange}
              placeholder="Search for sweets, chocolates, candies..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full md:w-48 px-4 py-3 border border-gray-300 rounded-xl hover:border-pink-300 transition"
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                {searchParams.category === 'all' ? 'All Categories' : searchParams.category}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategories && categories.length > 0 && (
              <div className="absolute z-10 mt-2 w-full md:w-48 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full px-4 py-3 text-left hover:bg-pink-50 transition ${
                      searchParams.category === category 
                        ? 'bg-pink-50 text-pink-600 font-medium' 
                        : 'text-gray-700'
                    } ${category === 'all' ? 'border-b border-gray-100' : ''}`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                    {category !== 'all' && (
                      <span className="float-right text-xs text-gray-400">
                        ({(Array.isArray(sweets) ? sweets : []).filter(s => s?.category === category).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:border-pink-300 transition"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  name="minPrice"
                  value={searchParams.minPrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={searchParams.maxPrice}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats - IMPROVED with better safety checks */}
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              In Stock: {(Array.isArray(sweets) ? sweets : []).filter(s => s?.quantity > 0).length}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Low Stock: {(Array.isArray(sweets) ? sweets : []).filter(s => s?.quantity > 0 && s?.quantity < 10).length}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              New: {(Array.isArray(sweets) ? sweets : []).filter(s => s?.isNew).length}
            </span>
          </div>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition shadow-sm"
          >
            Search Sweets
          </button>
        </div>
      </form>
    </div>
  )
}