import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, FileWarning, History, LogOut, Menu, X, Shield, MessageCircle } from "lucide-react"

// Import สำหรับดึงข้อมูล Realtime
import { db } from "../firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import api from "../api/axios"

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // State สำหรับเก็บจำนวนแจ้งเตือน
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [pendingReportCount, setPendingReportCount] = useState(0)

  const user = JSON.parse(localStorage.getItem("user"))

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  // 1. ดึงจำนวนแชทที่ยังไม่ได้อ่าน (Realtime)
  useEffect(() => {
    if (!user || !user.id) return

    const q = query(collection(db, "chats"), where("participants", "array-contains", user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        // เช็คว่ามี unread ของ user คนนี้ไหม
        if (data.unreadCounts && data.unreadCounts[user.id]) {
          total += data.unreadCounts[user.id]
        }
      })
      setUnreadChatCount(total)
    })

    return () => unsubscribe()
  }, [user?.id])

  // 2. ดึงจำนวนรายงานร้องเรียนที่รอตรวจสอบ (API)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/reports") // สมมติว่ามี endpoint นี้
        // นับเฉพาะสถานะที่ยังไม่ได้รับการแก้ไข (สมมติสถานะชื่อ 'pending')
        const pendingCount = res.data.filter((r) => r.status === "pending").length
        setPendingReportCount(pendingCount)
      } catch (err) {
        console.error("Failed to fetch report count", err)
      }
    }

    fetchReports()
    // อาจจะทำ interval เพื่อ fetch ใหม่ทุกๆ 1 นาที ถ้าต้องการ
    const interval = setInterval(fetchReports, 60000)
    return () => clearInterval(interval)
  }, [])

  // เมนูนำทาง (เพิ่ม badge เข้าไปใน object)
  const navItems = [
    // { label: "แดชบอร์ด", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "โปรไฟล์", path: "/admin/adminprofile", icon: Users },
    { label: "แชท", path: "/admin/chat", icon: MessageCircle, badge: unreadChatCount },
    { label: "จัดการผู้ใช้", path: "/admin/users", icon: Users },
    { label: "เรื่องร้องเรียน", path: "/admin/reports", icon: FileWarning, badge: pendingReportCount },
    { label: "ประวัติการรายงาน", path: "/admin/report-history", icon: History },
  ]

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Prompt']">
      {/* --- Mobile Header --- */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="text-indigo-400" /> Admin Panel
        </div>
        <div className="flex items-center gap-3">
          {/* แสดงจุดแดงแจ้งเตือนใน Mobile Header ถ้ามี */}
          {(unreadChatCount > 0 || pendingReportCount > 0) && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* --- Overlay for Mobile --- */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- Sidebar --- */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-indigo-400" size={24} />
            <span>Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>

                {/* Badge Notification Logic */}
                {item.badge > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white text-indigo-600" : "bg-red-500 text-white"}`}>{item.badge > 99 ? "99+" : item.badge}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex flex-1 overflow-auto pt-16 md:pt-0 scroll-smooth">
        <div className="flex flex-1 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
