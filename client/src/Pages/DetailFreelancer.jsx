import { useState, useEffect } from "react"
import {
  Briefcase,
  Star,
  CheckCircle,
  MessageCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from "lucide-react"
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
      Swal.fire("สำเร็จ!", "ส่งข้อเสนอเรียบร้อยแล้ว", "success")
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", "ส่งข้อเสนอไม่สำเร็จ", "error")
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col text-slate-800 rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">ส่งข้อเสนอจ้างงาน</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <Input
            label="ชื่องาน / โปรเจกต์"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="เช่น พัฒนาระบบ API ด้วย Node.js"
            error={errors.title}
          />
          <Input
            as="textarea"
            label="รายละเอียดงาน"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="ระบุข้อกำหนด สิ่งที่ต้องการได้รับ และขอบเขตงาน"
            error={errors.description}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="งบประมาณ (บาท)"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              placeholder="เช่น 15000"
              error={errors.rate}
            />
            <Input
              type="date"
              label="กำหนดส่งมอบงาน"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              min={today}
              error={errors.deadline}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-xs"
          >
            ยืนยันส่งข้อเสนอ
          </button>
        </div>
      </div>
    </div>
  )
}

const RatingBar = ({ label, score }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className="w-24 text-slate-500 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full"
        style={{ width: `${Math.min(Math.max((score / 5) * 100, 0), 100)}%` }}
      />
    </div>
    <span className="text-slate-700 font-semibold w-6 text-right">{score?.toFixed(1) || "0.0"}</span>
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
    let isMounted = true
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) setCurrentUser(JSON.parse(storedUser))

        const freelancerRes = await api.get(`/freelancers/detail/${id}`)
        if (!isMounted) return
        setFreelancers(freelancerRes.data)

        if (freelancerRes.data?.user?._id) {
          const [statsRes, reviewsRes] = await Promise.all([
            api.get(`/reviews/${freelancerRes.data.user._id}/rating`),
            api.get(`/reviews/${freelancerRes.data.user._id}`)
          ])
          if (!isMounted) return
          setStats(statsRes.data || { avgRating: 0, totalReviews: 0 })
          setReviews(reviewsRes.data || [])
        }
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [id])

  const isOwner =
    currentUser &&
    freelancers &&
    (freelancers.user?._id === currentUser.id || freelancers.user === currentUser.id)

  const bannerList = freelancers?.banners || []

  const PriceSummaryCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs text-slate-500 font-medium">ราคาเริ่มต้น</span>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
            ฿{Number(freelancers?.rate || 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block sm:inline sm:ml-1">/ งาน</span>
        </div>
      </div>

      <div className="space-y-2">
        {isOwner ? (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
            <User size={18} className="mx-auto text-slate-500 mb-1" />
            <p className="text-xs font-semibold text-slate-700">นี่คือประกาศบริการของคุณ</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setOpenOfferModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium text-sm transition shadow-xs active:scale-[0.99] cursor-pointer"
            >
              จ้างงานนี้
            </button>
            <button
              onClick={() =>
                startChat(
                  freelancers?.user?._id,
                  freelancers?.user?.name,
                  freelancers?.user?.profilePicture
                )
              }
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <MessageCircle size={16} className="text-slate-500" />
              <span>คุยรายละเอียดกับฟรีแลนซ์</span>
            </button>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
        <span>ระบบตรวจสอบและส่งมอบงานตามข้อตกลง</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-1 flex-col font-['Prompt',sans-serif] antialiased">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-4 mb-6 shadow-xs">
          <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[460px] w-full overflow-hidden rounded-xl bg-slate-100/70 flex items-center justify-center group">
            {bannerList.length > 0 ? (
              <img
                src={bannerList[currentIndex]?.url}
                alt={freelancers?.title || "service preview"}
                className="w-full h-full object-contain cursor-pointer transition-transform duration-300"
                onClick={() => setOpenPreview(true)}
              />
            ) : (
              <div className="text-slate-400 text-xs">ไม่มีรูปภาพตัวอย่าง</div>
            )}

            <button
              onClick={() => setOpenPreview(true)}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs"
              title="ดูภาพขนาดเต็ม"
            >
              <Maximize2 size={15} />
            </button>

            {bannerList.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? bannerList.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-sm transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === bannerList.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-sm transition"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {bannerList.length > 1 && (
            <div className="flex gap-2 mt-3 justify-center overflow-x-auto py-1">
              {bannerList.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-11 shrink-0 rounded-lg overflow-hidden border transition bg-slate-50 ${
                    currentIndex === index
                      ? "border-indigo-600 ring-1 ring-indigo-500"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img?.url} alt="thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {openPreview && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setOpenPreview(false)}
          >
            <img
              src={bannerList[currentIndex]?.url}
              alt="preview full"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
              onClick={() => setOpenPreview(false)}
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1">

          <section className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-medium text-slate-800">{freelancers?.category || "งานทั่วไป"}</span>
                <span>•</span>
                <span>โพสต์เมื่อ {formatRelativeTime(freelancers?.createdAt)}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-5">
                {freelancers?.title || "ไม่ระบุชื่อบริการ"}
              </h1>

              <div className="border-t border-slate-100 pt-5">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                  ขอบเขตและรายละเอียดงาน
                </h2>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {freelancers?.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                </div>
              </div>
            </div>

            <div className="block lg:hidden">
              <PriceSummaryCard />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={freelancers?.user?.profilePicture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {freelancers?.user?.name || "ผู้ให้บริการ"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span className="font-semibold">{stats.avgRating || "0.0"}</span>
                        <span>({stats.totalReviews})</span>
                      </span>
                      <span>•</span>
                      <span>เข้าร่วม {formatRelativeTime(freelancers?.user?.created_at)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/profile/${freelancers?.user?._id}`}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition"
                >
                  ดูโปรไฟล์
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  รีวิว ({stats.totalReviews})
                </h2>
              </div>

              {stats.totalReviews > 0 ? (
                <>
                  <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-5 flex flex-col md:flex-row gap-5 items-center">
                    <div className="flex flex-col items-center justify-center min-w-[100px] border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-5">
                      <div className="text-3xl font-bold text-slate-900 mb-0.5">
                        {stats.avgRating?.toFixed(1) || "0.0"}
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={`fill-current ${
                              star <= Math.round(stats.avgRating)
                                ? "text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-1.5">
                      <RatingBar label="ความรวดเร็ว" score={stats.avgSpeed} />
                      <RatingBar label="การบริการ" score={stats.avgService} />
                      <RatingBar label="ความเชี่ยวชาญ" score={stats.avgExpertise} />
                      <RatingBar label="ความคุ้มค่า" score={stats.avgValue} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ยังไม่มีรีวิวสำหรับบริการนี้
                </div>
              )}
            </div>
          </section>

          <aside className="hidden lg:block lg:sticky lg:top-6">
            <PriceSummaryCard />
          </aside>
        </div>
      </div>

      {openOfferModal && (
        <CreateOfferModal
          freelancerId={freelancers?.user?._id || freelancers?.user}
          onClose={() => setOpenOfferModal(false)}
        />
      )}
    </div>
  )
}

export default DetailFreelancer