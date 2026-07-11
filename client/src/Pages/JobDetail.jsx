import { useState, useEffect } from "react"
import { DollarSign, MessageCircle, Heart, Circle ,Trash2 } from "lucide-react"
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
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null })
    }
  }
  const validate = () => {
    const newErrors = {}
    if (!form.message.trim()) {
      newErrors.message = "กรุณาแนะนำตัวหรือแนวทางการทำงาน"
    }
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
      Swal.fire("เกิดข้อผิดพลาด!", "เกิดข้อผิดพลาดในการส่งข้อเสนอ", "error")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">เสนอเข้าทำงาน</h3>
        <Input as="textarea" label="แนะนำตัว / แนวทางทำงาน" name="message" value={form.message} onChange={handleChange} rows={4} placeholder="อธิบายประสบการณ์ แนวทาง หรือสิ่งที่คุณจะช่วยงานนี้ได้" error={errors.message} />

        <div className="flex gap-3 mt-6">
          <button onClick={submit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg">
            {loading ? "กำลังส่ง..." : "ส่งข้อเสนอ"}
          </button>

          <button onClick={onClose} disabled={loading} className="flex-1 bg-gray-100 hover:bg-gray-300 rounded-lg">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}

const JobDetail = () => {
  const { id } = useParams()
  const { startChat } = useStartChat();
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
  useEffect(() => {
    fetchJob()
  }, [id])

  const respondOffer = async (action) => {
    const titleMsg = action === "accept" ? "รับงานนี้?" : "ปฏิเสธ?"
    const message = action === "accept" ? "คุณต้องการรับงานนี้ใช่หรือไม่?" : "คุณต้องการปฏิเสธข้อเสนอนี้ใช่หรือไม่?"
    if (!(await Swal.fire({ title: titleMsg, text: message, icon: "warning", showCancelButton:true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"})).isConfirmed) return

    try {
      await api.patch(`/jobs/offer/${id}/respond`, { action })
      Swal.fire(action === "accept" ? "รับงานเรียบร้อย 🎉" : "ปฏิเสธข้อเสนอแล้ว", action === "accept" ? "คุณได้รับข้อเสนอนี้เรียบร้อย" : "คุณได้ปฏิเสธข้อเสนอนี้เรียบร้อย", action === "accept" ? "success" : "error")
      fetchJob()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถตอบข้อเสนอได้", "error")
    }
  }

  const fetchApplicants = () => {
    fetchJob()
  }

 const handleDeleteJob = async () => {
    // ถามยืนยัน
    const result = await Swal.fire({
      title: 'ต้องการลบประกาศนี้หรือไม่?',
      text: "หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      customClass: { popup: 'rounded-2xl' }
    });

    if (result.isConfirmed) {
      try {
        // ส่งคำสั่งลบ API
        await api.delete(`/jobs/${job._id}`); 

        // แสดงผลสำเร็จ
        await Swal.fire({
          title: 'ลบเรียบร้อย!',
          text: 'กำลังกลับไปหน้าประกาศงาน...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // 3. จุดสำคัญ: ย้ายไปหน้า Jobboard แทนการรีโหลดหน้าเดิม
        navigate("/jobboard"); 

      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบข้อมูลได้',
          icon: 'error'
        });
      }
    }
  };


  if (loading) return <div className="text-center py-24 text-slate-500">กำลังโหลดข้อมูล...</div>
  if (error) return <div className="text-center py-24 text-red-600 font-semibold">{error}</div>
  if (!job) return null

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50">
      <main className="px-4 sm:px-6 lg:px-8 py-12 md:mx-20">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Job Content */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 min-h-[500px] text-lg">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-extrabold text-indigo-600 mb-3">{job?.title}</h1>
                  <div className="flex items-center gap-3 text-slate-500 text-sm justify-between">
                    {job?.createdBy && <ProfileCard userId={job.createdBy._id} />}
                    <div className="flex gap-4">
                      <div className="flex flex-row gap-2">
                        <p className="text-black">หมวดหมู่งาน: </p>
                        <p>{job?.category ? job.category : '-'}</p>
                      </div>
                      <div className="flex flex-row gap-2">
                        <p className="text-black">ลักษณะการจ้าง: </p>
                        <p>{job?.type ? job.type : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center gap-3">
                  <button onClick={toggleFavorite} className={`p-2 rounded-full transition-colors ${isFavorite ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500"}`} title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มเข้าไปในรายการโปรด"}>
                  <Heart size={20} className={isFavorite ? "fill-current" : ""} />
                  </button>
                  </div> */}
              </div>
              <hr className="border-gray-200 mt-4 mb-6" />
              <h2 className="font-bold text-slate-800 mb-4">รายละเอียดงาน</h2>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{job?.description}</p>
            </div>

            <section className="space-y-8 hidden lg:block">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 min-h-[300px] text-lg">
                <h2 className="font-bold text-indigo-600 mb-4 ">ฟรีแลนซ์ที่สนใจ ทั้งหมด {job?.applicants?.length || 0} คน</h2>
                <div className="border border-gray-100 my-3">
                  {job?.applicants?.map((a) => (
                    <ApplicantCard
                      key={a._id}
                      applicant={a}
                      canAccept={job?.canAccept}
                      onAccept={() => {
                        ;(fetchApplicants(), fetchJob())
                      }}
                      jobId={id}
                    />
                  ))}
                </div>
              </div>
            </section>
          </section>

          {/* Right: Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <SectionCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex flex-col">
                  <p className="p-1 text-black">กำหนดส่งงาน</p>
                  <p className="px-1 ">{FormatDate(job?.deadline)}</p>
                  <p className="px-1 text-sm">{formatRelativeTime(job?.deadline)}</p>
                </div>
                <div className="flex flex-col ">
                  <p className="p-1 text-black">สิ้นสุดประกาศ</p>
                  <p className="px-1">{FormatDate(job?.endPost)}</p>
                  <p className="px-1 text-sm">{formatRelativeTime(job?.endPost)}</p>
                </div>
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex flex-col">
                  <p className="p-1 text-black">หมวดหมู่งาน: </p>
                  <p className="px-1">{job?.category}</p>
                </div>
                <div className="flex flex-col ">
                  <p className="p-1 text-black">ลักษณะการจ้าง: </p>
                  <p className="px-1">{job?.type}</p>
                </div>
              </div> */}
            </SectionCard>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex justify-between p-2 mb-4 ">
                <p className="text-slate-800 text-xl font-semibold">งบประมาณ</p>
                <span className="text-2xl font-extrabold text-indigo-600">฿{formatMoney(job?.rate)}</span>
              </div>
              {job.isOwner && (
                <div className="w-full mt-auto px-4 pb-4"> 
                {job.canAccept && (
                  <button onClick={handleDeleteJob} className="group w-full flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 active:scale-95" >
                    <Trash2 size={20} className="transition-transform duration-300 group-hover:rotate-12" />
                    ลบประกาศ
                  </button>
                )}
                {job.status === "in_progress" && !job?.completed && (
                  <button onClick={() => setOpenReviewModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95">
                    จบงาน
                  </button>
                )}
                {job.status === "offer" && (
                  <div className="text-sm text-slate-500 text-center mt-2">รอการตอบรับจากฟรีแลนซ์</div>
                )}
                {job.status === "rejected" && (
                  <div className="text-sm text-red-600 text-center mt-2 font-bold">งานถูกปฏิเสธ</div>
                )}
                {openReviewModal && (
                  <ReviewModal
                    jobId={id}
                    freelancerId={job?.freelancer}
                    onClose={() => {
                      setOpenReviewModal(false)
                    }}
                    onSuccess={fetchJob}
                  />
                )}
              </div>
              )}

              {!job?.isOwner && (
                <div className="grid grid-cols-2 gap-3">
                  {job.canApply && !job?.isOwner && !job?.hasApplied && (
                    <>
                      <button onClick={() => setOpenApplyModal(true)} className="bg-indigo-600 text-white py-3 rounded-xl font-bold">
                        สนใจงานนี้
                      </button>
                      {openApplyModal && (
                        <ApplyModal
                          jobId={id}
                          onClose={() => {
                            setOpenApplyModal(false)
                            fetchJob()
                          }}
                        />
                      )}
                    </>
                  )}
                  {job.hasApplied && (
                    <p className="text-sm text-gray-500 text-center py-3">
                      คุณได้ส่งข้อเสนอ
                      <br />
                      งานนี้แล้ว
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (job?.createdBy) {
                        startChat(
                          job.createdBy._id,
                          job.createdBy.name, 
                          job.createdBy.profilePicture, 
                        )
                      }
                    }}
                    className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    แชท
                  </button>
                </div>
              )}
              {job.completed && <div className="text-sm text-gray-500 text-center mt-4">งานเสร็จสิ้นแล้ว</div>}
              {job.isFreelancer && job.status === "in_progress" && <div className="text-sm text-green-600 text-center mt-4">คุณได้รับงานนี้แล้ว</div>}
              {job.isFreelancer && job.status === "rejected" && <div className="text-sm text-red-600 text-center mt-4">คุณปฏิเสธงานนี้แล้ว</div>}
            </div>
            {job.status === "offer" && !job.isOwner && (
              <SectionCard>
                <h3 className="font-semibold text-lg mb-2">ตอบรับข้อเสนอหรือไม่</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => respondOffer("accept")} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
                    รับทำงาน
                  </button>
                  <button onClick={() => respondOffer("reject")} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold">
                    ปฏิเสธ
                  </button>
                </div>
              </SectionCard>
            )}
            {job?.freelancer && (
              <SectionCard title={"ฟรีแลนซ์"}>
                <ProfileCard userId={job.freelancer} />
              </SectionCard>
            )}
          </aside>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 lg:hidden">
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 min-h-[300px] text-lg">
              <h2 className="font-bold text-indigo-600 mb-4 ">ฟรีแลนซ์ที่สนใจ ทั้งหมด {job?.applicants?.length || 0} คน</h2>
              <div className="border border-gray-100 my-3">
                {job?.applicants?.map((a) => (
                  <ApplicantCard
                    key={a._id}
                    applicant={a}
                    canAccept={job?.canAccept}
                    onAccept={() => {
                      ;(fetchApplicants(), fetchJob())
                    }}
                    jobId={id}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default JobDetail
