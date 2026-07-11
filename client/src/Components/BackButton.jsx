import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const BackButton = ({ label = "ย้อนกลับ", fallback = "/", className = "",}) => {
  const navigate = useNavigate()
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }
  return (
    <button onClick={handleBack} className={`inline-flex items-center my-4 gap-2 text-indigo-600 font-semibold hover:underline ${className}`} >
      <ArrowLeft size={18} />
      {label}
    </button>
  )
}

export default BackButton
