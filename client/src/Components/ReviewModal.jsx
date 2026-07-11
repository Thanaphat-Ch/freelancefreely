import { useState, useMemo } from "react"
import api from "../api/axios"
import Swal from "sweetalert2"

// Icon ดาว (ปรับลดขนาด default เป็น w-5 h-5)
const StarIcon = ({ filled, onClick, size = "w-5 h-5" }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#FBBF24" : "none"}
    stroke={filled ? "#FBBF24" : "#D1D5DB"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${size} cursor-pointer transition-transform duration-150 active:scale-95 hover:scale-110 ${
      filled ? "text-yellow-400" : "text-gray-300"
    }`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ReviewModal = ({ jobId, freelancerId, onClose, onSuccess }) => {
  const [ratings, setRatings] = useState({
    speed: 5,
    service: 5,
    expertise: 5,
    value: 5,
  })
  
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  // คำนวณค่าเฉลี่ย
  const averageRating = useMemo(() => {
    const values = Object.values(ratings)
    const sum = values.reduce((a, b) => a + b, 0)
    return (sum / values.length).toFixed(1)
  }, [ratings])

  const handleRatingChange = (category, score) => {
    setRatings((prev) => ({ ...prev, [category]: score }))
  }

  const submitReview = async () => {
    try {
      setLoading(true)
      const payload = {
        freelancerId,
        rating: Number(averageRating),
        ratingSpeed: ratings.speed,
        ratingService: ratings.service,
        ratingExpertise: ratings.expertise,
        ratingValue: ratings.value,
        comment,
      }

      await api.post(`/jobs/${jobId}/finish-with-review`, payload)
      onSuccess()
      onClose()
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกรีวิว", "error")
    } finally {
      setLoading(false)
    }
  }

  const ratingCategories = [
    { key: "speed", label: "ความเร็วตอบแชท" },
    { key: "service", label: "การให้บริการ" },
    { key: "expertise", label: "ความเชี่ยวชาญ" },
    { key: "value", label: "ความคุ้มค่าราคา" },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-5 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-800">รีวิวผลงาน</h3>
          <div className="flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
             <span className="text-yellow-600 font-bold text-lg">{averageRating}</span>
             <StarIcon filled size="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Grid Layout: 2 Columns บนหน้าจอส่วนใหญ่ (ใช้ min-[400px] เพื่อกันจอเล็กจิ๋วแตก) */}
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-x-4 gap-y-4 mb-5">
            {ratingCategories.map((cat) => (
              <div 
                key={cat.key} 
                className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center border border-gray-100"
              >
                <span className="text-xs font-semibold text-gray-600 mb-2 text-center">
                  {cat.label}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      size="w-5 h-5 sm:w-6 sm:h-6" // มือถือเล็ก=w-5, จอใหญ่=w-6
                      filled={star <= ratings[cat.key]}
                      onClick={() => handleRatingChange(cat.key, star)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="mb-4">
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-green-500 outline-none resize-none bg-white"
              rows={3}
              placeholder="เขียนความคิดเห็นเพิ่มเติม..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              disabled={loading}
              onClick={submitReview}
              className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? "..." : "ส่งรีวิว"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal