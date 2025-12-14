import { Link } from 'react-router-dom'
import { Home, AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mx-auto flex items-center justify-center">
            <AlertCircle className="w-20 h-20 text-pink-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-6xl">
            <span className="text-amber-600 font-bold">4</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-6xl">
            <span className="text-blue-600 font-bold">4</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 text-lg mb-8">
          Oops! The sweet treat you're looking for seems to have vanished. 
          Don't worry, we have plenty of other delicious options waiting for you!
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Browse Sweets
          </Link>
        </div>

        {/* Fun Facts */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
          <h3 className="font-semibold text-gray-800 mb-2">Did you know? 🍭</h3>
          <p className="text-gray-600 text-sm">
            While this page might be missing, we assure you our sweet collection 
            is complete! Visit our dashboard to explore over 50+ delicious treats.
          </p>
        </div>
      </div>
    </div>
  )
}