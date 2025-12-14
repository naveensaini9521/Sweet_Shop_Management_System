// frontend/src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
      <p className="text-gray-600">Manage your account information</p>
      <div className="mt-4 p-6 bg-white rounded-2xl shadow">
        <div className="mb-4">
          <p className="text-gray-700"><span className="font-semibold">Username:</span> {user?.username}</p>
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {user?.email}</p>
          <p className="text-gray-700"><span className="font-semibold">Role:</span> {user?.is_admin ? 'Admin' : 'Customer'}</p>
        </div>
        <p className="text-gray-500">Profile management features will be implemented here.</p>
      </div>
    </div>
  )
}