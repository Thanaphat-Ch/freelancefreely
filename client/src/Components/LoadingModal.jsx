import { useLoading } from "../context/LoadingContext"

const LoadingModal = () => {
  const { loading } = useLoading()
  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  )
}

export default LoadingModal
