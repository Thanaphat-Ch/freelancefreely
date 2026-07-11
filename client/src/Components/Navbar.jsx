import { Link, useLocation, useNavigate } from "react-router-dom"
import { Briefcase, User, LogOut, Settings, MessageCircleMore, Heart, Bell, BookOpen } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import api from "../api/axios"
import NotificationModal from "./NotificationModal"
import { db } from "../firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"

const Navbar = () => {
  const navigate = useNavigate()
  const [openProfile, setOpenProfile] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const isJobboard = location.pathname === "/jobboard"

  const user = JSON.parse(localStorage.getItem("user"))
  const [profilePicture, setProfilePic] = useState("")

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [totalUnreadChat, setTotalUnreadChat] = useState(0)

  useEffect(() => {
    if (!user) return

    // สมมติเก็บแจ้งเตือนใน collection 'notifications'
    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.id), // ดึงเฉพาะของ user เรา
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notiData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setNotifications(notiData)
    })

    return () => unsubscribe()
  }, [user?.id]) // run ใหม่ถ้า user เปลี่ยน

  const unread = notifications.filter((n) => !n.isRead).length

  // เพิ่ม useEffect สำหรับดึงตัวเลขแชท
  useEffect(() => {
    if (!user || !user.id) return

    // query ห้องแชททั้งหมดที่เราอยู่
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        // ดึงเลข unread ของเราออกมาบวก
        if (data.unreadCounts && data.unreadCounts[user.id]) {
          total += data.unreadCounts[user.id]
        }
      })
      setTotalUnreadChat(total)
    })

    return () => unsubscribe()
  }, [user?.id])

  useEffect(() => {
    const syncProfilePic = () => {
      const pic = localStorage.getItem("profilePic")
      setProfilePic(pic ? JSON.parse(pic) : "")
    }

    window.addEventListener("storage", syncProfilePic)
    syncProfilePic()

    return () => window.removeEventListener("storage", syncProfilePic)
  }, [])

  const handleLogout = () => {
    setOpenProfile(false)
    localStorage.removeItem("profilePic")
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  // click นอก dropdown ให้ปิด
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="bg-slate-950 text-white sticky top-0 z-50 shadow-2xl backdrop-blur-md bg-opacity-90">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group transition-all duration-300 active:scale-95">
            <div className="flex items-center gap-3">
              {/* ส่วนของ Icon: เพิ่มเอฟเฟกต์หมุนกลับและเงาฟุ้งเมื่อ Hover */}
              <div className="bg-indigo-600 p-2 rounded-xl rotate-12 transition-all duration-300 group-hover:rotate-0 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                <Briefcase size={20} className="text-white" />
              </div>

              {/* ส่วนของ Text: เพิ่มความสว่างของ Gradient และขยับขวาเล็กน้อย */}
              <span className="text-2xl font-extrabold bg-clip-text text-transparent hidden bg-gradient-to-r from-indigo-400 to-cyan-400 md:block transition-all duration-300 group-hover:from-indigo-300 group-hover:to-cyan-300 group-hover:translate-x-1">freelancefreely</span>
            </div>
          </Link>

          {/* Menu */}
          <div className="text-xs md:text-sm md:flex items-center space-x-8 "></div>

          {/* Right */}
          <div className="flex items-center gap-2 relative">
            {!user ? (
              <>
                <Link
                  to="/jobboard"
                  onClick={() => setOpenProfile(false)}
                  className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                  ${isJobboard ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900" : "bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-indigo-500 hover:text-white hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3.5 h-3.5 ${isJobboard ? "text-white animate-pulse" : "text-gray-500"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Jobboard
                </Link>
                <span className="h-6 border-1 border-gray-700" />
                <Link to="/login" className="text-xs md:text-sm bg-indigo-600 px-5 py-2 mr-0 rounded-full md:py-0 md:px-0  md:bg-transparent text-gray-300 hover:text-indigo-400 ">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="text-xs md:text-sm hidden md:block bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-full">
                  ลงทะเบียน
                </Link>
              </>
            ) : (
              <div ref={dropdownRef} className="relative flex gap-4 items-center">
                <Link
                  to="/jobboard"
                  onClick={() => setOpenProfile(false)}
                  className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                  ${isJobboard ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900" : "bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-indigo-500 hover:text-white hover:bg-gray-800 hover:-translate-y-0.5 shadow-sm"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3.5 h-3.5 ${isJobboard ? "text-white animate-pulse" : "text-gray-500"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Jobboard
                </Link>

                <span className="h-6 border-1 border-gray-700" />
                {/* chat */}
                <Link to="/chat" className="relative text-gray-300 hover:text-indigo-400">
                  <MessageCircleMore size={20} />
                  {/* แสดงจุดแดงแจ้งเตือน */}
                  {totalUnreadChat > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-950">{totalUnreadChat > 99 ? "99+" : totalUnreadChat}</span>}
                </Link>
                <button onClick={() => setOpen(!open)} className="relative">
                  <Bell />
                  {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded-full">{unread}</span>}
                </button>
                {open && (
                  <NotificationModal
                    notifications={notifications}
                    onClose={() => {
                      setOpen(false)
                    }}
                  />
                )}
                {/* Avatar */}
                <button onClick={() => setOpenProfile(!openProfile)} className="w-9 h-9 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center hover:bg-indigo-500">
                  {profilePicture ? <img src={profilePicture} alt="profile" className="w-full h-full rounded-full object-cover" /> : profilePicture?.name?.[0]}
                </button>

                {/* Dropdown */}
                {openProfile && (
                  <div className="absolute right-0 top-12 w-56 text-xs md:text-sm bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1 px-2 space-y-1">
                      <Link to={(user?.role === "admin" && "/admin/adminprofile") || "/myprofile"} onClick={() => setOpenProfile(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-md">
                        <User size={15} /> โปรไฟล์
                      </Link>
                      {/* <Link to="" onClick={() => setOpenProfile(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-md">
                        <User size={15} /> โปรไฟล์ฟรีแลนซ์
                      </Link> */}
                      <Link to="/guide" onClick={() => setOpenProfile(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 hover:text-white rounded-md transition-colors">
                        <BookOpen size={15} /> คู่มือการใช้งาน
                      </Link>

                      <Link to="/settings" onClick={() => setOpenProfile(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-md">
                        <Settings size={15} /> ตั้งค่า
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 p-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-slate-800 rounded-md">
                        <LogOut size={15} /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
