// frontend/src/components/sweets/SweetCard.jsx
export default function SweetCard({ sweet, onPurchase }) {
  const isOutOfStock = sweet.quantity === 0
  
  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{sweet.name}</h3>
            <p className="text-sm text-gray-500">{sweet.category}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            ID: {sweet.id.substring(0, 8)}...
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">{sweet.description || 'No description'}</p>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-pink-600">${sweet.price.toFixed(2)}</p>
          <p className={`text-sm ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
            {isOutOfStock ? 'Out of stock' : `${sweet.quantity} available`}
          </p>
        </div>
        
        <button
          onClick={() => !isOutOfStock && onPurchase(sweet.id)}
          disabled={isOutOfStock}
          className={`px-4 py-2 rounded-lg font-medium ${
            isOutOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Purchase'}
        </button>
      </div>
    </div>
  )
}