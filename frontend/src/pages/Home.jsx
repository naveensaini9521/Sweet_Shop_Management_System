import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Star, Award } from 'lucide-react'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-pink-600 mb-6">
        Welcome to Sweet Paradise 🍬
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Discover the finest collection of sweets, chocolates, and desserts. 
        Freshly made with love and delivered with care.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <ShoppingBag className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
          <p className="text-gray-600">Browse and purchase sweets with just a few clicks</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
          <p className="text-gray-600">All our sweets are crafted with premium ingredients</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Star className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
          <p className="text-gray-600">Highest quality standards for every sweet</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Award Winning</h3>
          <p className="text-gray-600">Recognized for excellence in sweet making</p>
        </div>
      </div>

      <div className="space-x-4">
        <Link
          to="/login"
          className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition"
        >
          Get Started
        </Link>
        <Link
          to="/dashboard"
          className="inline-block border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition"
        >
          Browse Sweets
        </Link>
      </div>
    </div>
  )
}