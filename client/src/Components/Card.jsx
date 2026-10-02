import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Star, DollarSign, Clock, User, Calendar, Briefcase, MessageCircle } from "lucide-react"
import api from "../api/axios"
import { FormatDate, formatMoney, formatPrice } from "../utils/Format"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Swal from "sweetalert2"
import { useStartChat } from "../hooks/useStartChat"


export const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    })
  }

  // ปรับ Status จากป้าย (Pill) ก้อนใหญ่ๆ เป็นจุดสี (Dot) มินิมอลเรียบหรู
  const getStatusDisplay = (status) => {
    const config = {
      in_progress: { color: "bg-amber-400", text: "กำลังทำ" },
      completed: { color: "bg-emerald-500", text: "เสร็จสิ้น" },
      open: { color: "bg-indigo-500", text: "รับสมัคร" },
      offer: { color: "bg-purple-500", text: "ข้อเสนอ" },
      rejected: { color: "bg-red-500", text: "ปฏิเสธ" },
    }
    const current = config[status || "open"]

    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <span className={`w-1.5 h-1.5 rounded-full ${current.color}`} />
        {current.text}
      </div>
    )
  }

  return (
    <Link to={`/job/${job._id}`} className="group block h-full">
      <div className="h-full flex flex-col bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-slate-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative">
        
        {/* Header: Status & Date */}
        <div className="flex justify-between items-center mb-4">
          {getStatusDisplay(job.status)}
          <span className="text-[11px] text-slate-400 font-medium">
            ประกาศเมื่อ {formatDate(job.createdAt)}
          </span>
        </div>

        {/* Content: Title & Description */}
        <div className="mb-4 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2">
            {job.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {job.description || "ไม่มีรายละเอียดเพิ่มเติม"}
          </p>
        </div>

        {/* Tags: แปลงจากกล่องสี เป็นตัวหนังสือคั่นด้วยจุด (Typographic Tags) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium mb-5">
          <span className="text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{job.category || "ไม่ระบุหมวดหมู่"}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{job.type || "ไม่ระบุลักษณะงาน"}</span>
        </div>

        {/* Footer: Deadline & Price */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">รับสมัครถึง</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {formatDate(job.endPost)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">งบประมาณ</p>
            <div className="text-base sm:text-lg font-bold text-indigo-600">
              ฿{job.rate ? Number(job.rate).toLocaleString() : "0"}
            </div>
          </div>
        </div>

      </div>
    </Link>
  )
}

export const FreelancerCard = ({ freelancer, isOwner = false, onEdit, onRefresh }) => {
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(freelancer?.isActive ?? true)

  const handleDelete = async (e) => {
    e.stopPropagation()
    const confirmResult = await Swal.fire({
      title: "คุณแน่ใจหรือไม่ที่จะลบงานนี้?",
      text: "ข้อมูลและรูปภาพทั้งหมดจะถูกลบออก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบงาน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B"
    })

    if (!confirmResult.isConfirmed) return

    try {
      await api.delete(`/freelancers/${freelancer._id}`)
      onRefresh && onRefresh()
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบงานได้ในขณะนี้", "error")
    }
  }

  const handleToggleStatus = async (e) => {
    e.stopPropagation()
    try {
      const res = await api.patch(`/freelancers/${freelancer._id}/status`)
      setIsActive(res.data.isActive)
    } catch (err) {
      console.error("Toggle failed", err)
    }
  }

  return (
    <div
      onClick={() => navigate(`/detailfreelancer/${freelancer._id}`)}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-indigo-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ease-out cursor-pointer"
    >
      {/* สถานะเปิด/ปิดรับงาน (สำหรับ Owner) หรือ Badge ประเภทบริการ */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
        {isOwner ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-sm ${
              isActive
                ? "bg-emerald-500/90 text-white"
                : "bg-slate-700/90 text-slate-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-slate-400"}`} />
            {isActive ? "เปิดรับงาน" : "ปิดรับงาน"}
          </span>
        ) : (
          freelancer?.category && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/70 backdrop-blur-md text-white border border-white/10 shadow-xs">
              {freelancer.category}
            </span>
          )
        )}
      </div>

      {/* Banner รูปภาพปกบริการ */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={freelancer?.banners?.[0]?.url || "/src/assets/image/default-banner.png"}
          alt={freelancer?.title || "service banner"}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
      </div>

      {/* รายละเอียดบริการ */}
      <div className={`flex flex-col flex-1 p-4 sm:p-5 ${isOwner ? "pb-16" : ""}`}>
        {/* หัวข้อบริการ (Service Title) */}
        <h3
          className="text-sm sm:text-base font-semibold text-slate-800 leading-snug line-clamp-2 min-h-11 group-hover:text-indigo-600 transition-colors"
          title={freelancer?.title}
        >
          {freelancer?.title || "บริการงานด้านเทคโนโลยีและซอฟต์แวร์"}
        </h3>

        {/* ผู้ให้บริการ & ราคาเริ่มต้น */}
        <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <ProfileCard userId={freelancer?.user} />
          </div>

          <div className="text-right shrink-0">
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              ราคาเริ่มต้น
            </span>
            <div className="text-indigo-600 font-bold text-base leading-tight">
              {freelancer?.rate ? (
                <>
                  <span className="text-xs font-semibold mr-0.5">฿</span>
                  {formatPrice(freelancer.rate)}
                </>
              ) : (
                <span className="text-slate-400 text-sm font-normal">ตามตกลง</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar สำหรับเจ้าของงาน (Owner Control) */}
      {isOwner && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-slate-50/95 backdrop-blur-md border-t border-slate-200/80 px-3.5 py-2 flex justify-between items-center z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {isActive ? <Eye size={13} className="text-emerald-600" /> : <EyeOff size={13} />}
            <span>{isActive ? "แสดงงานอยู่" : "ซ่อนงานนี้"}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit && onEdit()
              }}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="แก้ไขรายละเอียดงาน"
            >
              <Edit size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="ลบงานนี้"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const ProfileCard = ({ userId }) => {
  const [profileData, setProfileData] = useState({})

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`)
        if (isMounted) setProfileData(res.data || {})
      } catch (err) {
        console.error("Failed to fetch user profile", err)
      }
    }
    if (userId) fetchProfile()
    return () => {
      isMounted = false
    }
  }, [userId])

  return (
    <Link
      to={`/profile/${profileData._id || userId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-2 max-w-full group/profile hover:opacity-85 transition-opacity"
    >
      <div className="w-7 h-7 rounded-full bg-linear-to-tr from-indigo-600 to-sky-400 p-px shrink-0">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {profileData.profilePicture ? (
            <img
              src={profileData.profilePicture}
              alt={profileData.name || "profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-indigo-600 text-xs font-bold">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : <User size={13} />}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover/profile:text-indigo-600 truncate">
        {profileData.name || "ฟรีแลนซ์"}
      </span>
    </Link>
  )
}

export const ReviewCard = ({ review }) => {
  if (!review) return
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <ProfileCard userId={review.reviewer?._id} />
          <span className="text-xs text-gray-400 mt-0.5 block">{FormatDate(review.createdAt)}</span>
        </div>

        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
          <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
          <span className="font-bold text-yellow-700 text-sm">{review.rating?.toFixed(1)}</span>
        </div>
      </div>

      <div className="pl-0 sm:pl-13">
        {" "}
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{review.comment || "ไม่มีความคิดเห็นเพิ่มเติม"}</p>
      </div>
    </div>
  )
}


export const SectionCard = ({ title, icon: Icon, children, tab = [], className = "", overflow }) => {
  const [activeTab, setActiveTab] = useState(tab[0]?.key)
  return (
    <div className={`flex flex-col bg-white rounded-3xl p-6 md:p-8 shadow-sm space-y-4 ${className}`}>
      <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${title ? "" : "hidden"}`}>
        {Icon && <Icon size={18} />} {title}
      </h3>
      {tab.length > 0 && (
        <div className="flex gap-2">
          {tab.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1 rounded-lg text-md font-medium sm:text-sm transition
                    ${activeTab === t.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className={`space-y-6 ${overflow ? "overflow-y-auto" : ""}`}>{typeof children === "function" ? children(activeTab) : children}</div>
      {/* <div className="space-y-6">{children}</div> */}
    </div>
  )
}

export const ApplicantCard = ({ applicant, canAccept, jobId, onAccept }) => {
  const { startChat } = useStartChat();

  const accept = async () => {
    const ok = confirm("ยืนยันจ้างงานฟรีแลนซ์คนนี้หรือไม่?\nหลังจากยืนยันแล้วจะไม่สามารถเปลี่ยนได้")
    if (!ok) return
    try {
      await api.post(`/jobs/${jobId}/accept/${applicant.user._id}`)
      if (onAccept) onAccept()
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", "เกิดข้อผิดพลาดในการจ้างงาน", "error")
      console.error(err)
    }
  }

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all  p-5 mt-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="w-full sm:flex-1">
          <ProfileCard userId={applicant.user._id} />
        </div>

        <div className="flex items-center sm:self-start w-full sm:w-auto mt-2 sm:mt-0">
          {/* {canAccept && applicant.status === "pending" ? (
            <button
              onClick={accept}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:scale-95 text-white px-5 py-2 rounded-lg text-sm font-medium transition-transform shadow-sm"
            >
              จ้างงาน
            </button>
           ) : (
            applicant.status !== "pending" && (
              <div className={`
                w-full sm:w-auto text-center px-3 py-1.5 rounded-lg text-xs font-bold border
                ${applicant.status === "accepted" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"}
              `}>
                {applicant.status === "accepted" ? "✔ รับทำงานแล้ว" : "✖ ไม่ได้รับเลือก"}
              </div>
            )
          )} */}
          {canAccept ? (
            <div className="flex gap-2">
              <button onClick={() => startChat(applicant?.user?._id, applicant?.user?.name, applicant?.user?.profilePicture)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แชทกับผู้ใช้">
                          <MessageCircle size={18} />
              </button>
              <button onClick={accept} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:scale-95 text-white px-5 py-2 rounded-lg text-sm font-medium transition-transform shadow-sm">
                จ้างงาน
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {applicant.message && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{applicant.message}</p>
        </div>
      )}
    </div>
  )
}
