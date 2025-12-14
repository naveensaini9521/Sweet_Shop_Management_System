import { ShoppingBag, Star, Package, TrendingUp, Zap, Tag } from 'lucide-react'

export default function SweetCard({ sweet, onPurchase }) {
  const isOutOfStock = sweet.quantity === 0
  const isLowStock = sweet.quantity > 0 && sweet.quantity < 10
  const isNew = sweet.isNew || false

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Sweet Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-pink-100 to-amber-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-24 h-24 text-pink-300 group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-full shadow-md">
              <Zap className="w-3 h-3 inline mr-1" />
              NEW
            </span>
          )}
          <span className="px-3 py-1 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-sm font-medium text-pink-700 shadow-sm">
            {sweet.category}
          </span>
        </div>
        
        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
            isOutOfStock 
              ? 'bg-red-100 text-red-700' 
              : isLowStock 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-green-100 text-green-700'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} left`}
          </span>
        </div>
        
        {/* Popularity Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="ml-1 text-sm font-semibold text-gray-700">
                {sweet.rating || '4.8'}
              </span>
            </div>
            {sweet.popularity && (
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                {sweet.popularity}% popular
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sweet Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition">
            {sweet.name}
          </h3>
          {sweet.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
          {sweet.description || 'Delicious sweet treat made with premium ingredients'}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-pink-600">
              ${sweet.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">per piece</p>
          </div>

          <button
            onClick={() => onPurchase(sweet.id)}
            disabled={isOutOfStock}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700 hover:shadow-lg active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Purchase'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}