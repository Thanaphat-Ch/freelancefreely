import { useEffect, useState } from "react"
import { Mail, Phone, MapPin, Calendar, Edit2, Save, X, User } from "lucide-react"
import api from "../../api/axios"
import { FormatDate } from "../../utils/Format"
import Swal from "sweetalert2"

const inputBase = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  // ดึงข้อมูล Admin
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/me`)
        const data = {
          ...res.data,
          joinDate: FormatDate(res.data.createdAt),
        }
        setProfileData(data)
        setOriginalData(data)
      } catch (err) {
        console.error("Fetch profile failed:", err)
      }
    }
    fetchProfile()
  }, [])

  // จัดการ Preview รูปภาพ
  useEffect(() => {
    return () => {
      if (avatarFile && profileData?.profilePicture) {
        URL.revokeObjectURL(profileData.profilePicture)
      }
    }
  }, [avatarFile])

  if (!profileData) return <div className="p-10 text-center">Loading...</div>

  // บันทึกข้อมูล
  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append("name", profileData.name || "")
      formData.append("bio", profileData.bio || "")
      formData.append("phone", profileData.phone || "")
      formData.append("address", profileData.address || "")
      
      if (avatarFile) {
        formData.append("profilePicture", avatarFile)
      }

      const res = await api.put(
        "/users",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      setProfileData(res.data)
      setOriginalData(res.data)
      setAvatarFile(null)
      setIsEditing(false)
      Swal.fire("บันทึกเรียบร้อย", "ข้อมูลของคุณถูกบันทึกแล้ว", "success")
    } catch (err) {
      console.error("Update failed:", err)
      Swal.fire("เกิดข้อผิดพลาด!", "เกิดข้อผิดพลาดในการบันทึก", "error")
    }
  }

  // ยกเลิกการแก้ไข
  const handleCancel = () => {
    setProfileData(originalData)
    setAvatarFile(null)
    setIsEditing(false)
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-500 p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">โปรไฟล์ผู้ดูแลระบบ</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Left Column: Avatar & Basic Info --- */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center border border-slate-100">
            {/* Avatar Circle */}
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-400" />
                )}
              </div>

              {isEditing && (
                <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 transition">
                  <Edit2 size={16} className="text-indigo-600" />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      setAvatarFile(file)
                      setProfileData({
                        ...profileData,
                        profilePicture: URL.createObjectURL(file),
                      })
                    }}
                  />
                </label>
              )}
            </div>

            {/* Name & Bio */}
            <div className="min-h-8 mb-2">
              {isEditing ? (
                <input 
                  className={inputBase + " text-xl font-bold text-center"} 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-800">{profileData.name}</h2>
              )}
            </div>
            
            <p className="text-sm text-slate-500 mb-4 bg-slate-100 py-1 px-3 rounded-full inline-block">
                Administrator
            </p>

            {isEditing ? (
              <textarea 
                rows={3} 
                className={inputBase + " text-sm"} 
                placeholder="คำอธิบายตัวตน..."
                value={profileData.bio || ""} 
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} 
              />
            ) : (
              <p className="text-slate-600 text-sm">{profileData.bio || "ไม่มีคำอธิบาย"}</p>
            )}
          </div>
          
           {/* Join Date */}
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-500"/>
                  <span>วันที่เข้าร่วม</span>
              </div>
              <span className="font-medium">{profileData.joinDate || "-"}</span>
           </div>
        </div>

        {/* --- Right Column: Contact Details --- */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">ข้อมูลติดต่อ</h3>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm">
                      <Save size={16} /> บันทึก
                    </button>
                    <button onClick={handleCancel} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-sm">
                      <X size={16} /> ยกเลิก
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm">
                    <Edit2 size={16} /> แก้ไขข้อมูล
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Email (Read Only) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Mail size={16}/> อีเมล (เปลี่ยนไม่ได้)
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200">
                    {profileData.email}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Phone size={16}/> เบอร์โทรศัพท์
                </label>
                {isEditing ? (
                  <input 
                    className={inputBase} 
                    value={profileData.phone || ""} 
                    placeholder="0XX-XXX-XXXX"
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                  />
                ) : (
                  <div className="p-3 bg-white rounded-lg text-slate-800 border border-slate-100">
                    {profileData.phone || "-"}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <MapPin size={16}/> ที่อยู่
                </label>
                {isEditing ? (
                  <textarea 
                    rows={3}
                    className={inputBase} 
                    value={profileData.address || ""} 
                    placeholder="ที่อยู่..."
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} 
                  />
                ) : (
                  <div className="p-3 bg-white rounded-lg text-slate-800 border border-slate-100 min-h-[80px]">
                    {profileData.address || "-"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile