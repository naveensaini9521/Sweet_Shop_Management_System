// frontend/src/App.jsx
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 flex flex-col">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App