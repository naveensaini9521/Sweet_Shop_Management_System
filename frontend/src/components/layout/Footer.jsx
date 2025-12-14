import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-50 to-rose-50 border-t border-pink-100 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold text-pink-600 mb-2">
              Sweet Shop 🍬
            </h3>
            <p className="text-gray-600">
              Making the world sweeter, one treat at a time
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 flex items-center justify-center">
              Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by Sweet Shop
            </p>
            <p className="text-sm text-gray-500 mt-2">
              © {new Date().getFullYear()} Sweet Shop Management System. All rights reserved.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}