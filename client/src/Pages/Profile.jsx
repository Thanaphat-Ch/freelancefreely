import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Calendar, Briefcase, X, Award, FileText, Flag, AlertTriangle, Loader2, ImagePlus, Star as StarIcon } from "lucide-react"
import api from "../api/axios"
import BackButton from "../Components/BackButton"
import { FreelancerCard, ReviewCard, SectionCard } from "../Components/Card"
import CreateFreelancerProfileModal from "../Components/CreateFreelancerProfile"
import Swal from "sweetalert2"
import { resizeImage } from "../utils/imageResizer"

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
      icon: StarIcon,
    },
    { label: "วันที่เข้าร่วม", value: profileData?.joinDate || "-", icon: Calendar },
  ]

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
      <main className="max-w-7xl mx-auto px-4 py-4 w-full">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center relative group">
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

            {isPostModalOpen && <CreateFreelancerProfileModal onClose={() => setIsPostModalOpen(false)} onSuccess={() => fetchJobs()} />}

            <SectionCard className="h-[300px] bg-transparent" overflow={true} title="รีวิวจากผู้ว่าจ้าง">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {isReportModalOpen && <ReportUserModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} targetUser={profileData} targetId={id} />}
      </main>
    </div>
  )
}

const ReportUserModal = ({ isOpen, onClose, targetUser, targetId }) => {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = async (e) => {
    const rawFiles = Array.from(e.target.files)
    if (!rawFiles.length) return

    if (rawFiles.length + images.length > 5) {
      Swal.fire("เกิดข้อผิดพลาด!", "อัปโหลดได้สูงสุด 5 รูป", "error")
      return
    }

    const resizedFiles = await Promise.all(rawFiles.map((file) => resizeImage(file, 1024, 1024, 0.7)))
    const newPreviews = resizedFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...resizedFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviews])
    e.target.value = ""
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("targetUserId", targetId)
      formData.append("reason", reason)
      formData.append("description", description)

      images.forEach((image) => {
        formData.append("evidence", image)
      })

      await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      })

      Swal.fire("สำเร็จ", "ส่งรายงานเรียบร้อยแล้ว", "success")
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
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-4">
            คุณกำลังรายงานบัญชี: <span className="font-semibold text-slate-900">{targetUser?.name}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                หัวข้อการรายงาน <span className="text-red-500">*</span>
              </label>
              <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" value={reason} onChange={(e) => setReason(e.target.value)}>
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
              <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-28 resize-none focus:ring-2 focus:ring-red-500 outline-none" placeholder="ระบุวันเวลา หรือรายละเอียดที่พบเจอ..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">หลักฐาน (รูปภาพ)</label>
              <div className="flex flex-wrap gap-2">
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                  <ImagePlus className="text-slate-400" size={24} />
                  <span className="text-[10px] text-slate-500 mt-1">เพิ่มรูป</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {previewUrls.map((url, index) => (
                  <div key={index} className="w-20 h-20 relative group">
                    <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">รองรับไฟล์ JPG, PNG (สูงสุด 5 รูป)</p>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                ยกเลิก
              </button>
              <button type="submit" disabled={isSubmitting || !reason} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "ส่งรายงาน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-slate-500">
    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
    <p className="font-medium">{text}</p>
  </div>
)

export default Profile
