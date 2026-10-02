import { useState, useEffect } from "react"
import { DollarSign, MessageCircle, Heart, Circle, Trash2, X } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../api/axios"
import BackButton from "../Components/BackButton"
import { ApplicantCard, ProfileCard, SectionCard } from "../Components/Card"
import { FormatDate, formatMoney, formatRelativeTime } from "../utils/Format"
import ReviewModal from "../Components/ReviewModal"
import Input from "../Components/Input"
import { useStartChat } from "../hooks/useStartChat"
import Swal from "sweetalert2"

const ApplyModal = ({ jobId, onClose, onSuccess }) => {
  const [form, setForm] = useState({ message: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }
  
  const validate = () => {
    const newErrors = {}
    if (!form.message.trim()) newErrors.message = "กรุณาแนะนำตัวหรือเสนอแนวทางการทำงาน"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      await api.post(`/jobs/${jobId}/apply`, form)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถส่งข้อเสนอได้ในขณะนี้", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">เสนอตัวเข้าทำงาน</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5">
          <Input as="textarea" label="แนะนำตัว / แนวทางการทำงาน" name="message" value={form.message} onChange={handleChange} rows={4} placeholder="อธิบายประสบการณ์และแนวทางที่คุณจะช่วยให้งานนี้สำเร็จ" error={errors.message} />
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} disabled={loading} className="flex-1 text-sm font-medium py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              ยกเลิก
            </button>
            <button onClick={submit} disabled={loading} className="flex-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-xl transition shadow-xs">
              {loading ? "กำลังส่ง..." : "ยืนยันส่งข้อเสนอ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const JobDetail = () => {
  const { id } = useParams()
  const { startChat } = useStartChat()
  const [job, setJob] = useState(null)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [openApplyModal, setOpenApplyModal] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/detail/${id}`)
      setJob(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJob() }, [id])

  const respondOffer = async (action) => {
    const titleMsg = action === "accept" ? "ยืนยันรับงานนี้?" : "ปฏิเสธข้อเสนอ?"
    const message = action === "accept" ? "คุณต้องการรับผิดชอบโปรเจกต์นี้ใช่หรือไม่?" : "คุณต้องการปฏิเสธข้อเสนอนี้ใช่หรือไม่?"
    const result = await Swal.fire({ title: titleMsg, text: message, icon: "warning", showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก" })
    if (!result.isConfirmed) return

    try {
      await api.patch(`/jobs/offer/${id}/respond`, { action })
      Swal.fire(action === "accept" ? "รับงานเรียบร้อย 🎉" : "ปฏิเสธข้อเสนอแล้ว", "", action === "accept" ? "success" : "success")
      fetchJob()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถทำรายการได้", "error")
    }
  }

  const handleDeleteJob = async () => {
    const result = await Swal.fire({
      title: 'ต้องการลบประกาศนี้หรือไม่?',
      text: "หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ลบประกาศ',
      cancelButtonText: 'ยกเลิก',
      customClass: { popup: 'rounded-2xl' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/jobs/${job._id}`); 
        await Swal.fire({ title: 'ลบเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
        navigate("/jobboard"); 
      } catch (error) {
        console.error(error);
        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบข้อมูลได้', icon: 'error' });
      }
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-500 font-['Prompt']">กำลังโหลดข้อมูล...</div>
  if (error) return <div className="text-center py-24 text-red-600 font-medium font-['Prompt']">{error}</div>
  if (!job) return null

  // Components ย่อยที่ถูกเรียกใช้ซ้ำในหน้าจอมือถือและ Desktop
  const ActionCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-5">
        <span className="text-sm font-semibold text-slate-700">งบประมาณ</span>
        <span className="text-2xl sm:text-3xl font-bold text-indigo-600">฿{formatMoney(job?.rate)}</span>
      </div>

      <div className="space-y-3">
        {job.isOwner ? (
          <>
            {job.canAccept && (
              <button onClick={handleDeleteJob} className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Trash2 size={16} /> ลบประกาศ
              </button>
            )}
            {job.status === "in_progress" && !job?.completed && (
              <button onClick={() => setOpenReviewModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                จบงานและรีวิว
              </button>
            )}
            {job.status === "offer" && (
              <div className="text-sm text-slate-500 text-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">รอการตอบรับจากฟรีแลนซ์</div>
            )}
            {job.status === "rejected" && (
              <div className="text-sm text-red-600 text-center py-2.5 bg-red-50 rounded-xl font-medium">งานถูกปฏิเสธ</div>
            )}
            
            {openReviewModal && (
              <ReviewModal jobId={id} freelancerId={job?.freelancer} onClose={() => setOpenReviewModal(false)} onSuccess={fetchJob} />
            )}
          </>
        ) : (
          <>
            {job.canApply && !job?.isOwner && !job?.hasApplied && (
              <button onClick={() => setOpenApplyModal(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium transition shadow-xs">
                สนใจเสนอตัวรับงาน
              </button>
            )}
            {job.hasApplied && (
              <div className="text-sm text-slate-600 text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
                คุณได้ส่งข้อเสนอสำหรับงานนี้แล้ว
              </div>
            )}
            <button
              onClick={() => {
                if (job?.createdBy) startChat(job.createdBy._id, job.createdBy.name, job.createdBy.profilePicture)
              }}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} className="text-slate-500" /> แชทสอบถาม
            </button>
          </>
        )}

        {/* Status Indicators */}
        {job.completed && <div className="text-sm text-slate-500 text-center mt-3 pt-3 border-t border-slate-100">โปรเจกต์เสร็จสิ้นแล้ว</div>}
        {job.isFreelancer && job.status === "in_progress" && <div className="text-sm text-emerald-600 text-center mt-3 pt-3 border-t border-slate-100 font-medium">คุณเป็นผู้รับผิดชอบงานนี้</div>}
        {job.isFreelancer && job.status === "rejected" && <div className="text-sm text-red-600 text-center mt-3 pt-3 border-t border-slate-100 font-medium">คุณปฏิเสธงานนี้แล้ว</div>}
      </div>

      {/* Accept / Reject card for Freelancer receiving an offer */}
      {job.status === "offer" && !job.isOwner && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">ตอบรับคำเชิญ</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => respondOffer("accept")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition">
              รับงาน
            </button>
            <button onClick={() => respondOffer("reject")} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-sm font-medium transition">
              ปฏิเสธ
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const DatesInfoCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">ข้อมูลระยะเวลา</h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">กำหนดส่งงาน (Deadline)</p>
          <p className="text-sm font-medium text-slate-700">{FormatDate(job?.deadline) || 'ไม่ระบุ'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{job?.deadline ? formatRelativeTime(job?.deadline) : ''}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">สิ้นสุดประกาศรับสมัคร</p>
          <p className="text-sm font-medium text-slate-700">{FormatDate(job?.endPost) || 'ไม่ระบุ'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{job?.endPost ? formatRelativeTime(job?.endPost) : ''}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC] font-['Prompt',_sans-serif] antialiased">
      {openApplyModal && <ApplyModal jobId={id} onClose={() => setOpenApplyModal(false)} onSuccess={fetchJob} />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* คอลัมน์ซ้าย: เนื้อหาหลัก */}
          <section className="lg:col-span-2 space-y-6">
            
            {/* กล่องรายละเอียดงาน */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{job?.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{job?.category || '-'}</span>
                  <span>•</span>
                  <span>{job?.type || '-'}</span>
                  {job?.createdBy && (
                    <>
                      <span>•</span>
                      <span>โพสต์โดย <span className="font-medium text-slate-700">{job.createdBy.name}</span></span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">รายละเอียดงาน</h2>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {job?.description}
                </div>
              </div>
            </div>

            {/* แสดง ActionCard บนมือถือ (แทรกไว้ใต้รายละเอียดงานทันที) */}
            <div className="block lg:hidden space-y-6">
              <ActionCard />
              <DatesInfoCard />
            </div>

            {/* ผู้สมัคร (แสดงเฉพาะเจ้าของประกาศ) */}
            {job?.isOwner && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                  <h2 className="font-bold text-slate-900">ผู้ที่สนใจเสนอตัวรับงาน</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">{job?.applicants?.length || 0} คน</span>
                </div>
                
                {job?.applicants?.length > 0 ? (
                  <div className="space-y-3">
                    {job.applicants.map((a) => (
                      <ApplicantCard key={a._id} applicant={a} canAccept={job?.canAccept} onAccept={() => fetchJob()} jobId={id} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-6">ยังไม่มีผู้เสนอตัวรับงาน</p>
                )}
              </div>
            )}
          </section>

          {/* คอลัมน์ขวา: Sidebar (Desktop เท่านั้น) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <ActionCard />
            <DatesInfoCard />
            
            {/* โปรไฟล์ฟรีแลนซ์ที่รับงานไปแล้ว (ถ้ามี) */}
            {job?.freelancer && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">ฟรีแลนซ์ที่รับผิดชอบโปรเจกต์</h3>
                <ProfileCard userId={job.freelancer} />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}

export default JobDetail