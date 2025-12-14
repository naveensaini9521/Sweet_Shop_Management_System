export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getSweetCategoryColor = (category) => {
  const colors = {
    'Chocolate': 'bg-amber-100 text-amber-800',
    'Candy': 'bg-pink-100 text-pink-800',
    'Pastry': 'bg-orange-100 text-orange-800',
    'Dessert': 'bg-purple-100 text-purple-800',
    'Traditional': 'bg-emerald-100 text-emerald-800',
    'Special': 'bg-rose-100 text-rose-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}