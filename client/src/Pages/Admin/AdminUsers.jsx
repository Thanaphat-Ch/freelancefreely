import { useState, useEffect } from "react"
import { Search, CheckCircle, Ban, Loader2, Eye, X, Mail, Phone, Calendar, ShieldAlert, MessageCircle } from "lucide-react"
import api from "../../api/axios"
import { useStartChat } from "../../hooks/useStartChat"
import Swal from "sweetalert2"

// ==============================
// 1. Modal แสดงรายละเอียดผู้ใช้
// ==============================
const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">ข้อมูลผู้ใช้งาน</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold mb-3 border-4 border-white shadow-sm">
              {user.profilePicture ? <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs mt-1 ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{user.role}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="text-slate-400" size={18} />
              <div className="flex-1">
                <p className="text-xs text-slate-500">อีเมล</p>
                <p className="text-sm font-medium text-slate-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone className="text-slate-400" size={18} />
              <div className="flex-1">
                <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                <p className="text-sm font-medium text-slate-800">{user.phone || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="text-slate-400" size={18} />
              <div className="flex-1">
                <p className="text-xs text-slate-500">วันที่สมัคร</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(user.created_at || user.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* แสดงจำนวนครั้งที่ทำผิด (ถ้ามี) */}
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <ShieldAlert className="text-red-500" size={18} />
              <div className="flex-1">
                <p className="text-xs text-red-500">ประวัติการทำผิดกฎ (Violation Count)</p>
                <p className="text-sm font-bold text-red-700">{user.violationCount || 0} ครั้ง</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 2. Main Component
// ==============================
const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null) // State สำหรับ Modal

  const { startChat } = useStartChat()

  // Fetch Users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get("/users") // เรียก endpoint ที่สร้างไว้
      setUsers(res.data)
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBan = async (id, currentBanStatus, name) => {
    const newStatus = !currentBanStatus
    const action = newStatus ? "ระงับการใช้งาน (แบน)" : "ปลดแบน" // ข้อความสำหรับ Confirm
    // if (!window.confirm(`คุณต้องการ "${action}" ผู้ใช้ ${name} ใช่หรือไม่?`)) return
    if (!(await Swal.fire({ title:"ยืนยัน?", text: `คุณต้องการ "${action}" ผู้ใช้ ${name} ใช่หรือไม่?`, icon: "question", showCancelButton:true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"})).isConfirmed) return

    try {
      // ส่งค่า newStatus ไปให้ Backend ด้วย
      const res = await api.patch(`/users/${id}/ban`, { status: newStatus })

      // อัปเดตข้อมูลในตาราง
      setUsers(users.map((u) => (u._id === id ? { ...u, isBanned: res.data.data.isBanned } : u)))

      // อัปเดตข้อมูลใน Modal (ถ้าเปิดอยู่)
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser({ ...selectedUser, isBanned: res.data.data.isBanned })
      }
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", "เกิดข้อผิดพลาดในการอัปเดตสถานะ", "error")
      console.error(err)
    }
  }
  // Filter Search
  const filteredUsers = users.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    )

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
          <p className="text-slate-500 text-sm">รายชื่อสมาชิกทั้งหมด {users.length} คน</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="ค้นหาชื่อ หรือ อีเมล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-72 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
                <th className="px-6 py-4 font-semibold">ผู้ใช้งาน</th>
                <th className="px-6 py-4 font-semibold">สถานะ</th>
                <th className="px-6 py-4 font-semibold">บทบาท</th>
                <th className="px-6 py-4 font-semibold">จำนวนรายงาน</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} onClick={() => setSelectedUser(user)} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">{user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : user.name?.[0]}</div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${!user.isBanned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {!user.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {!user.isBanned ? "ปกติ" : "ถูกแบน"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 text-sm capitalize bg-slate-100 px-2 py-1 rounded-md">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${user.violationCount > 0 ? "text-red-600" : "text-slate-400"}`}>{user.violationCount || 0} ครั้ง</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* ปุ่มดูรายละเอียด */}
                        {/* <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ดูรายละเอียด">
                          <Eye size={18} />
                        </button> */}
                        <button onClick={() => startChat(user._id, user.name, user.profilePicture)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แชทกับผู้ใช้">
                          <MessageCircle size={18} />
                        </button>

                        {/* ปุ่มแบน */}
                        <button
                          onClick={() => handleToggleBan(user._id, user.isBanned, user.name)}
                          className={`p-2 rounded-lg transition-colors ${user.isBanned ? "text-green-600 hover:bg-green-50 hover:text-green-700" : "text-red-400 hover:bg-red-50 hover:text-red-600"}`}
                          title={user.isBanned ? "ปลดแบน" : "แบนผู้ใช้"}
                        >
                          {user.isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* เรียกใช้ Modal */}
      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}

export default AdminUsers
