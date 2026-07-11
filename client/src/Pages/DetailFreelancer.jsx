import { useState, useEffect } from "react"
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Star, CheckCircle, MessageCircle, Heart, User } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import BackButton from "../Components/BackButton"
import api from "../api/axios"
import { ReviewCard } from "../Components/Card"
import Input from "../Components/Input"
import { useStartChat } from "../hooks/useStartChat"
import { formatRelativeTime } from "../utils/Format"
import Swal from "sweetalert2"

const CreateOfferModal = ({ freelancerId, onClose }) => {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: "",
    description: "",
    rate: "",
    deadline: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = "กรุณากรอกชื่องาน"
    if (!form.description.trim()) newErrors.description = "กรุณากรอกรายละเอียดงาน"
    if (!form.rate) {
      newErrors.rate = "กรุณากรอกราคา"
    } else if (Number(form.rate) <= 0) {
      newErrors.rate = "ราคาต้องมากกว่า 0"
    }
    if (!form.deadline) newErrors.deadline = "กรุณาเลือกวันส่งงาน"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!freelancerId) {
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่พบข้อมูลฟรีแลนซ์", "error")
      return
    }
    if (!validateForm()) return
    try {
      await api.post("/jobs/offer", {
        freelancerId,
        title: form.title,
        description: form.description,
        rate: form.rate,
        deadline: form.deadline,
      })
      Swal.fire("success!", "ส่งข้อเสนอเรียบร้อย 🎉", "success")
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", "ส่งข้อเสนอไม่สำเร็จ", "error")
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white flex flex-col text-sm rounded-3xl w-full max-w-xl m-4 p-6 sm:p-8 shadow-2xl max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">จ้างงานฟรีแลนซ์</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 text-xl">
            ✕
          </button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto">
          <Input label="หัวข้องาน" name="title" value={form.title} onChange={handleChange} placeholder="เช่น ออกแบบเว็บไซต์บริษัท" error={errors.title} />
          <Input as="textarea" label="รายละเอียดงาน" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="อธิบายขอบเขตงานที่ต้องการ" error={errors.description} />
          <Input type="number" label="งบประมาณ (บาท)" name="rate" value={form.rate} onChange={handleChange} placeholder="เช่น 30000" error={errors.rate} />
          <Input type="date" label="ส่งมอบงานภายใน" name="deadline" value={form.deadline} onChange={handleChange} min={today} error={errors.deadline} />
          <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg transition">
            ส่งข้อเสนอจ้างงาน
          </button>
        </div>
      </div>
    </div>
  )
}
const RatingBar = ({ label, score }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-28 text-slate-600 font-medium">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
    </div>
    <span className="text-slate-800 font-bold w-6 text-right">{score?.toFixed(1)}</span>
  </div>
)

const DetailFreelancer = () => {
  const { id } = useParams()
  const { startChat } = useStartChat()
  const [currentUser, setCurrentUser] = useState(null)
  const [freelancers, setFreelancers] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    avgSpeed: 0,
    avgService: 0,
    avgExpertise: 0,
    avgValue: 0,
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [openPreview, setOpenPreview] = useState(false)
  const [openOfferModal, setOpenOfferModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem("user")))
        const freelancerRes = await api.get(`/freelancers/detail/${id}`)
        setFreelancers(freelancerRes.data)
        const [statsRes, reviewsRes] = await Promise.all([api.get(`/reviews/${freelancerRes.data.user._id}/rating`), api.get(`/reviews/${freelancerRes.data.user._id}`)])

        setStats(statsRes.data || { avgRating: 0, totalReviews: 0 })
        setReviews(reviewsRes.data || [])
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err)
      }
    }

    fetchData()
  }, [id])

  const isOwner = currentUser && freelancers && (freelancers.user?._id === currentUser.id || freelancers.user === currentUser.id)

  return (
    <div className="min-h-screen flex flex-1 bg-slate-50 overflow-hidden px-4">
      <main className="flex-1 flex flex-col sm:px-6 lg:px-8 pt-5 pb-12 md:mx-25 max-w-7xl overflow-hidden">
        <BackButton />

        {/* Image Banner */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 p-2 sm:p-4 mb-8 lg:px-40 overflow-hidden">
          <div className="relative aspect-video overflow-hidden rounded-2xl group">
            <img src={freelancers?.banners?.[currentIndex]?.url} alt="banner" className="w-full h-full object-cover cursor-pointer" onClick={() => setOpenPreview(true)} />

            {/* Navigation Buttons */}
            {freelancers?.banners?.length > 1 && (
              <>
                <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? freelancers?.banners.length - 1 : prev - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/60">
                  ‹
                </button>
                <button onClick={() => setCurrentIndex((prev) => (prev === freelancers?.banners.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/60">
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {freelancers?.banners?.length > 1 && (
            <div className="flex flex-1 gap-3 mt-4 justify-center overflow-x-auto scrollbar-hide py-2 mx-2">
              {freelancers?.banners.map((img, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className={`w-20 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition ${currentIndex === index ? "border-indigo-600" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={img?.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {openPreview && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setOpenPreview(false)}>
            <img src={freelancers?.banners?.[currentIndex]?.url} className="max-w-full max-h-full rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button className="absolute top-4 right-4 text-white p-2" onClick={() => setOpenPreview(false)}>
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[400px]">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-3">{freelancers?.title || "ไม่ระบุชื่อบริการ"}</h1>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                    <Briefcase size={14} />
                    {freelancers?.category}
                  </span>
                </div>
              </div>
              <hr className="border-gray-100 my-6" />
              <h2 className="text-lg font-bold text-slate-800 mb-4">รายละเอียดงาน</h2>
              <p className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-line">{freelancers?.description}</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img src={freelancers?.user?.profilePicture || "/default-avatar.png"} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50" />
                  <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-800">{freelancers?.user?.name || "ชื่อฟรีแลนซ์"}</h3>
                  <p className="text-slate-500 text-sm mb-3">เข้าร่วมเมื่อ {formatRelativeTime(freelancers?.user?.created_at)}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>
                        {stats.avgRating} ({stats.totalReviews} รีวิว)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                      <CheckCircle size={16} className="text-indigo-500" />
                      <span>ยืนยันตัวตนแล้ว</span>
                    </div>
                  </div>
                </div>
                <Link to={`/profile/${freelancers?.user?._id}`} className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition">
                  ดูโปรไฟล์
                </Link>
              </div>
            </div>

            {/* 2. Review Section (New!) */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                รีวิวจากผู้ว่าจ้าง
                <span className="text-sm font-normal text-slate-400">({stats.totalReviews} รีวิว)</span>
              </h2>

              {stats.totalReviews > 0 ? (
                <>
                  {/* Stats Dashboard */}
                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center justify-center min-w-[120px]">
                      <div className="text-5xl font-extrabold text-slate-800 mb-1">{stats.avgRating}</div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} className={`fill-current ${star <= Math.round(stats.avgRating) ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">คะแนนเฉลี่ยรวม</span>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="flex-1 w-full space-y-2 border-l border-gray-200 md:pl-8 border-t md:border-t-0 pt-4 md:pt-0">
                      <RatingBar label="ความรวดเร็ว" score={stats.avgSpeed} />
                      <RatingBar label="การบริการ" score={stats.avgService} />
                      <RatingBar label="ฝีมือ/เชี่ยวชาญ" score={stats.avgExpertise} />
                      <RatingBar label="ความคุ้มค่า" score={stats.avgValue} />
                    </div>
                  </div>

                  {/* Review List Loop */}
                  <div className="space-y-2">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                  <p>ยังไม่มีรีวิวสำหรับงานนี้</p>
                </div>
              )}
            </div>
          </section>

          {/* --- Right Column: Sidebar --- */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-3 mb-6 justify-between px-0.5">
                <span className="text-lg font-bold text-slate-700">ราคาเริ่มต้น</span>
                <span className="text-2xl font-bold text-indigo-600">฿ {Number(freelancers?.rate || 0).toLocaleString()}</span>
              </div>

              <div className="grid gap-3">
                {isOwner ? (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 py-4 rounded-xl font-bold text-center flex flex-col items-center justify-center gap-2">
                    <User size={24} />
                    <span>นี่คือประกาศงานของคุณ</span>
                    {/* อาจจะใส่ Link ไปหน้า Edit ตรงนี้ได้ */}
                    {/* <Link to={`/manage/job/${id}`} className="text-sm underline">แก้ไขประกาศ</Link> */}
                  </div>
                ) : (
                  <>
                    <button onClick={() => setOpenOfferModal(true)} className="bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                      จ้างงานนี้
                    </button>
                    <button onClick={() => startChat(freelancers.user._id, freelancers.user.name, freelancers.user.profilePicture)} className="bg-white border border-gray-200 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle size={18} />
                      ทักแชทสอบถาม
                    </button>
                  </>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-slate-700">การันตีโดยระบบ</h4>
                  <p className="text-xs text-slate-500 mt-1">งานของคุณจะถูกคุ้มครองจนกว่างานจะเสร็จสมบูรณ์</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        {openOfferModal && <CreateOfferModal freelancerId={freelancers?.user?._id || freelancers?.user} onClose={() => setOpenOfferModal(false)} />}
      </main>
    </div>
  )
}

export default DetailFreelancer
