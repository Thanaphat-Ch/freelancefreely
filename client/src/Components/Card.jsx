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

  const getStatusBadge = (status) => {
    const styles = {
      in_progress: "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      open: "bg-blue-50 text-blue-600 border-blue-100",
      offer: "bg-purple-50 text-purple-600 border-purple-100",
      rejected: "bg-red-50 text-red-600 border-red-100",
    }
    const labels = {
      in_progress: "กำลังทำ",
      completed: "เสร็จสิ้น",
      open: "รับสมัคร",
      offer: "ข้อเสนอ",
      rejected: "ปฏิเสธ",
    }
    const currentStatus = status || "open"

    return <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap ${styles[currentStatus] || "bg-gray-100 text-gray-600"}`}>{labels[currentStatus] || currentStatus}</span>
  }

  return (
    <Link to={`/job/${job._id}`} className="block h-full group">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden">
        {/* Header: Date & Status */}
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-medium bg-slate-50 px-1.5 py-0.5 rounded-md">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="truncate">เมื่อ: {formatDate(job.createdAt)}</span>
          </div>
          <div className="ml-2">{getStatusBadge(job.status)}</div>
        </div>

        {/* Title & Description */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-1">{job.title}</h3>
          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 h-8 sm:h-10 overflow-hidden">{job.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
        </div>

        {/* Tags Row: Category & Type */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-semibold">
            <Briefcase size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="truncate max-w-[100px] sm:max-w-none">{job.category}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-[10px] sm:text-xs font-semibold capitalize">
            <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
            {job.type}
          </span>
        </div>

        {/* Divider (Dotted line ดูเบากว่า) */}
        <div className="border-t border-dashed border-gray-200 mt-auto mb-3 sm:mb-4"></div>

        {/* Footer: Deadline & Price */}
        <div className="flex items-end justify-between gap-2">
          {/* Left: Deadline */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">ปิดรับ</span>
            <span className="text-xs sm:text-sm font-medium text-slate-600">{formatDate(job.endPost)}</span>
          </div>

          {/* Right: Price */}
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-0.5 text-emerald-600 font-bold text-base sm:text-lg">
              {/* <DollarSign size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" /> */}
             
              <span className="">฿</span>
              {formatMoney(job.rate)}
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1">บาท</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export const FreelancerCard = ({ freelancer, isOwner = false, onEdit, onRefresh }) => {
  const navigate = useNavigate()
  // const [rating, setRating] = useState(freelancer.rating || 0)
  const [isActive, setIsActive] = useState(freelancer.isActive)

  // useEffect(() => {
  //   const fetchstat = async () => {
  //     try {
  //       const res = await api.get(`/reviews/${freelancer.user}/rating`)
  //       setRating(res.data.avgRating || null)
  //     } catch (err) {
  //       console.error("Failed to fetch jobs", err)
  //     }
  // } 
  //   fetchstat()
  // }, [freelancer.user])
  
  const handleDelete = async (e) => {
    e.stopPropagation(); // ไม่ให้กดทะลุไปหน้ารายละเอียด
    // if (!window.confirm(" รูปภาพทั้งหมดจะถูกลบด้วย")) return;
    if (!(await Swal.fire({ title:"คุณแน่ใจหรือไม่ที่จะลบงานนี้?", text: "รูปภาพทั้งหมดจะถูกลบด้วย", icon: "question", showCancelButton:true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"})).isConfirmed) return
    
    try {
        await api.delete(`/freelancers/${freelancer._id}`);
        onRefresh && onRefresh(); // รีโหลดหน้า
    } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด!", "ลบไม่สำเร็จ", "error")
    }
  }

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    try {
        const res = await api.patch(`/freelancers/${freelancer._id}/status`);
        setIsActive(res.data.isActive);
    } catch (err) {
        console.error("Toggle failed", err);
    }
  }

  return (
    <div
      onClick={() => navigate(`/detailfreelancer/${freelancer._id}`)}
      className="
        group relative flex flex-col h-full
        bg-white rounded-2xl overflow-hidden
        border border-slate-100
        transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/50
        cursor-pointer
      "
    >
      {isOwner && (
          <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
              {isActive ? 'เปิดรับงาน' : 'ปิดรับงาน'}
          </div>
      )}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={freelancer?.banners?.[0]?.url || "/src/assets/image/default-banner.png"} alt={freelancer?.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className={`flex flex-col flex-1 p-5 ${isOwner ? 'pb-16' : ''}`}>
        <div className={`${isOwner ? 'mb-2' : 'mb-4'}`}>
          <div className="flex justify-between items-start gap-2 mb-2">
            {/* <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-slate-700">{rating || "0.0"}</span>
            </div> */}
          </div>

          <h3
            className="
                    text-sm font-semibold text-slate-800 leading-snug
                    line-clamp-2         /* ตัดคำเมื่อเกิน 2 บรรทัด */
                    min-h-11  
                    group-hover:text-indigo-600 transition-colors
                "
            title={freelancer.title} 
          >
            {freelancer.title || "บริการที่คุณอาจสนใจ"}
          </h3>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {" "}
              <div className="truncate">
                <ProfileCard userId={freelancer.user} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[8px] text-slate-400 font-medium">เริ่มต้น</p>
              <p className="text-indigo-600 font-medium text-sm leading-none">{freelancer.rate ? `฿${formatPrice(freelancer.rate)}` : "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <div 
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-2 flex justify-between items-center z-20"
            onClick={(e) => e.stopPropagation()} // กดตรงนี้ไม่ไปหน้า detail
        >
            {/* Toggle Switch แบบปุ่มกดง่ายๆ */}
            <button 
                onClick={handleToggleStatus}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                {isActive ? <Eye size={14}/> : <EyeOff size={14}/>}
                {isActive ? "แสดงอยู่" : "ซ่อน"}
            </button>

            <div className="flex gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="แก้ไข"
                >
                    <Edit size={16} />
                </button>
                <button 
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
      )}
    </div>
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

export const ProfileCard = ({ userId }) => {
  const [profileData, setProfileData] = useState({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`)
        setProfileData(res.data)
      } catch (err) {
        console.error("Failed to fetch jobs", err)
      }
    }
    fetchProfile()
  }, [userId])

  return (
    <Link to={`/profile/${profileData._id}`} className="rounded-xl">
      <div className="flex items-center gap-2 ">
         <div className="w-8 h-8 rounded-full bg-indigo-500 from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {profileData.profilePicture ? <img src={profileData.profilePicture} alt="profile" className="w-full h-full rounded-full object-cover" /> : profileData.name?.[0]}
        </div>
        <div>
          <h4 className="text-slate-700">{profileData.name || "undefind"}</h4>
        </div>
      </div>
    </Link>
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
