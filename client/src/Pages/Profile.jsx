import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Calendar,
  Briefcase,
  X,
  Award,
  FileText,
  Flag,
  AlertTriangle,
  Loader2,
  ImagePlus,
  Star as StarIcon // เปลี่ยนชื่อเพื่อไม่ให้ชนกับ Component Star ด้านล่าง
} from "lucide-react"
import api from "../api/axios"
import BackButton from "../Components/BackButton"
import { FreelancerCard, JobCard, ReviewCard, SectionCard } from "../Components/Card"
import CreateFreelancerProfileModal from "../Components/CreateFreelancerProfile"
import Swal from "sweetalert2"

// ==========================================
// 1. ฟังก์ชัน Utility สำหรับย่อรูปภาพ (วางไว้นอก Component)
// ==========================================
const resizeImage = (file) => {
  return new Promise((resolve) => {
    // ถ้าไม่ใช่รูปภาพ ให้คืนค่าไฟล์เดิมกลับไปเลย
    if (!file.type.match(/image.*/)) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        // --- ตั้งค่าขนาดที่ต้องการ ---
        const MAX_WIDTH = 1024 // กว้างสูงสุด 1024px
        const MAX_HEIGHT = 1024 // สูงสูงสุด 1024px
        let width = img.width
        let height = img.height

        // คำนวณ Aspect Ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        // วาดลง Canvas
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        // แปลงกลับเป็น File (JPEG quality 0.7 = 70%)
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          },
          "image/jpeg",
          0.7 // <-- ปรับคุณภาพตรงนี้ (0.1 - 1.0) ยิ่งน้อยไฟล์ยิ่งเล็ก
        )
      }
    }
  })
}

// ==========================================
// 2. Component หลัก Profile
// ==========================================
const Profile = () => {
  const { id } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [freelanceprofile, setFreelanceprofile] = useState([])
  const [myJobs, setMyJobs] = useState([])

  const [reviews, setReviews] = useState([])
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const stats = [
    { label: "งานที่สมัคร", value: myJobs?.length || "-", icon: Briefcase },
    { label: "งานที่เสร็จ", value: myJobs?.filter((job) => job.status === "completed")?.length || "-", icon: Award },
    { 
      label: "คะแนน", 
      value: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : "-", 
      icon: StarIcon // ใช้ icon ที่ rename มา
    },
    { label: "วันที่เข้าร่วม", value: profileData?.joinDate || "-", icon: Calendar },
  ]

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/reviews/${id}`)
        setReviews(res.data || [])
      } catch (err) {
        console.error("Fetch review failed", err)
      }
    }
    fetchReview()
  }, [id])

  const fetchJobs = async () => {
    try {
      const [myJobRes, freelancerres] = await Promise.all([api.get(`/jobs/${id}`), api.get(`/freelancers/${id}`)])
      setMyJobs(myJobRes.data || [])
      setFreelanceprofile(freelancerres.data || [])
    } catch (err) {
      console.error("Fetch jobs failed", err)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`)
        const data = {
          ...res.data,
          joinDate: new Date(res.data.created_at).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }
        localStorage.setItem("profilePic", JSON.stringify(res.data.profilePicture))
        setProfileData(data)
      } catch (err) {
        console.error("Fetch profile failed:", err)
      }
    }
    fetchProfile()
    fetchJobs()
  }, [id])

  if (!profileData) return null

  return (
    <div className="flex flex-1 min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-10 w-full">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center relative group">
              {/* ปุ่ม Report มุมขวาบน */}
              <button onClick={() => setIsReportModalOpen(true)} className="absolute top-5 right-5 text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all" title="รายงานผู้ใช้รายนี้">
                <Flag size={20} />
              </button>

              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold">{profileData.profilePicture ? <img src={profileData.profilePicture} alt="profile" className="w-full h-full rounded-full object-cover" /> : profileData.name?.[0]}</div>
              </div>
              <div className="min-h-8">
                <h1 className="text-xl font-bold">{profileData.name}</h1>
              </div>
              <p className="text-slate-600 text-sm text-left p-4 bg-gray-100 rounded-xl h-32">{profileData.bio}</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="space-y-3">
                {stats.map((s, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                      <s.icon size={18} className="text-indigo-600" />
                      {s.label}
                    </div>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard title="ทักษะ">
              <div className="flex flex-wrap gap-2 mb-4">
                {(profileData.skills || []).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-md font-semibold mb-2">Resume</p>
                {profileData.resume ? (
                  <a href={profileData.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm font-medium">
                    <FileText size={16} />
                    {profileData.resumeName || "Resume.pdf"}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">ยังไม่มี Resume</p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard className="h-[700px] overflow-y-auto" overflow={true} tab={[{ label: "โปรไฟล์", key: "freelanceprofile" }]}>
              {(activeTab) => (
                <div className="space-y-4">
                  {activeTab === "freelanceprofile" &&
                    (freelanceprofile.length === 0 ? (
                      <>
                        <div className="flex justify-between">
                          <div className="text-sm sm:text-lg flex gap-2 my-2">
                            <p>โปรไฟล์ของ {profileData.name} </p>
                            <p className="text-indigo-600">{freelanceprofile.length}</p>
                            <p>งาน </p>
                          </div>
                        </div>
                        <div className="flex-1 my-20">
                          <EmptyState text="ไม่มีโปรไฟล์ฟรีแลนซ์ที่สร้างไว้" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <div className="text-sm sm:text-lg flex gap-2 my-2">
                            <p>โปรไฟล์ของ {profileData.name} </p>
                            <p className="text-indigo-600">{freelanceprofile.length}</p>
                            <p>โปรไฟล์ </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {freelanceprofile.map((freelancer) => (
                            <FreelancerCard key={freelancer._id} freelancer={freelancer} />
                          ))}
                        </div>
                      </>
                    ))}
                </div>
              )}
            </SectionCard>

            {isPostModalOpen && (
              <CreateFreelancerProfileModal
                onClose={() => setIsPostModalOpen(false)}
                onSuccess={() => {
                  fetchJobs()
                }}
              />
            )}

            <SectionCard className="h-[300px] bg-transparent" overflow={true} title={"รีวิวจากผู้ว่าจ้าง"}>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* 4. เรียกใช้ Modal Report */}
        {isReportModalOpen && <ReportUserModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} targetUser={profileData} targetId={id} />}
      </main>
    </div>
  )
}

// ==========================================
// 3. Modal Report (พร้อม Resize รูปภาพ)
// ==========================================
const ReportUserModal = ({ isOpen, onClose, targetUser, targetId }) => {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([]) // เก็บไฟล์รูป
  const [previewUrls, setPreviewUrls] = useState([]) // เก็บ URL เพื่อพรีวิว
  const [isSubmitting, setIsSubmitting] = useState(false)

  // จัดการเมื่อเลือกรูป
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      Swal.fire("เกิดข้อผิดพลาด!", "อัปโหลดได้สูงสุด 5 รูป", "error")
      return
    }
    setImages([...images, ...files])

    // สร้าง Preview URL
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls([...previewUrls, ...newPreviews])
  }

  // ลบรูปที่เลือก
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviewUrls(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("targetUserId", targetId)
      formData.append("reason", reason)
      formData.append("description", description)

      const resizedImages = await Promise.all(
        images.map(async (image) => {
          return await resizeImage(image)
        })
      )
      resizedImages.forEach((image) => {
        formData.append("evidence", image)
      })

      await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
       timeout: 30000,
      })

      Swal.fire("success", "ส่งรายงานเรียบร้อยแล้ว", "success")
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", err.response?.data?.message || "เกิดข้อผิดพลาด", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="font-bold text-red-900 text-lg">รายงานผู้ใช้</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-sm text-slate-600 mb-4">
            คุณกำลังรายงานบัญชี: <span className="font-semibold text-slate-900">{targetUser?.name}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                หัวข้อการรายงาน <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">-- เลือกหัวข้อ --</option>
                <option value="spam">สแปม / โฆษณาขยะ</option>
                <option value="fake_profile">โปรไฟล์ปลอม</option>
                <option value="harassment">คุกคาม / ใช้ถ้อยคำรุนแรง</option>
                <option value="fraud">ฉ้อโกง</option>
                <option value="inappropriate_content">เนื้อหาไม่เหมาะสม</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-28 resize-none focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="ระบุวันเวลา หรือรายละเอียดที่พบเจอ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">หลักฐาน (รูปภาพ)</label>
              <div className="flex flex-wrap gap-2">
                {/* ปุ่มเพิ่มรูป */}
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                  <ImagePlus className="text-slate-400" size={24} />
                  <span className="text-[10px] text-slate-500 mt-1">เพิ่มรูป</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {/* Preview รูป */}
                {previewUrls.map((url, index) => (
                  <div key={index} className="w-20 h-20 relative group">
                    <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">รองรับไฟล์ JPG, PNG (สูงสุด 5 รูป)</p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "ส่งรายงาน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Star = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-slate-500">
    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
    <p className="font-medium">{text}</p>
  </div>
)

export default Profile