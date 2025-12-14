import { useParams } from 'react-router-dom'

export default function SweetDetails() {
  const { id } = useParams()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Sweet Details</h1>
      <p className="text-gray-600">Viewing sweet with ID: {id}</p>
      <div className="mt-4 p-6 bg-white rounded-2xl shadow">
        <p className="text-gray-500">Sweet details page will display product information, images, and purchase options.</p>
      </div>
    </div>
  )
}