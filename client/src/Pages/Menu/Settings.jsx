import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Settings as SettingsIcon, Bell, Lock, User, Save, Trash2 } from "lucide-react";
import BackButton from "../../Components/BackButton";
import api from "../../api/axios";
import Swal from "sweetalert2";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(false);

  // State สำหรับข้อมูล User
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    firstName: "", 
    lastName: ""  
  });

  // State สำหรับเปลี่ยนรหัสผ่าน
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });


  const tabs = [
    // { id: "notifications", label: "การแจ้งเตือน", icon: Bell },
    { id: "security", label: "ความปลอดภัย", icon: Lock },
    { id: "account", label: "บัญชี", icon: User }
  ];

  // Helper สำหรับดึง Token
  const getAuthHeader = () => {
    const token = localStorage.getItem("token"); // หรือ key ที่คุณเก็บ token ไว้
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Fetch User Data เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me", getAuthHeader()); 

        setUserData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || ""
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  // 2. Handle Update Profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // ส่งข้อมูลไป update
      await api.put("/users", userData, getAuthHeader());
      Swal.fire("บันทึกเรียบร้อบ", "ข้อมูลของคุณถูกบันทึกเรียบร้อย", "success")
    } catch (err) {
      console.error(err);
      Swal.fire("เกิดข้อผิดพลาด!", err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก", "error")
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Change Password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("เกิดข้อผิดพลาด!", "รหัสผ่านใหม่ไม่ตรงกัน", "error")
      return;
    }
    if (passwordData.newPassword.length < 6) {
        Swal.fire("เกิดข้อผิดพลาด!", "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร", "error")
        return;
    }

    setLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, getAuthHeader());
      Swal.fire("success", "เปลี่ยนรหัสผ่านสำเร็จ", "success")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      Swal.fire("เกิดข้อผิดพลาด!", err.response?.data?.message || "รหัสผ่านเดิมไม่ถูกต้อง", "error")
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // 1. แสดง Pop-up ถามยืนยัน
    const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะหายไป!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', 
        cancelButtonColor: '#3085d6', 
        confirmButtonText: 'ใช่, ลบบัญชีเลย!',
        cancelButtonText: 'ยกเลิก'
    });
    if (result.isConfirmed) {
        setLoading(true);
        try {
            await api.delete("/users", getAuthHeader());
            await Swal.fire(
                'ลบเรียบร้อย!',
                'บัญชีของคุณถูกลบออกจากระบบแล้ว',
                'success'
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("profilePic");
            navigate("/login"); 

        } catch (err) {
            console.error(err);
            Swal.fire(
                'เกิดข้อผิดพลาด!',
                'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่อีกครั้ง',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }
};

  return (
    <div className="flex flex-1 min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-10 w-full">
        <BackButton />

        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon size={28} className="text-indigo-600" />
            <h1 className="text-3xl font-extrabold text-slate-800">ตั้งค่าบัญชี</h1>
          </div>
          <p className="text-slate-500">
            จัดการข้อมูลบัญชี การแจ้งเตือน และรายการโปรดของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            
            {/* --- Security Tab --- */}
            {activeTab === "security" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Lock size={24} className="text-indigo-600" />
                  <h2 className="text-2xl font-bold text-slate-800">ความปลอดภัย</h2>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-800 mb-4">เปลี่ยนรหัสผ่าน</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่านปัจจุบัน</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่านใหม่</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <button 
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                      >
                        {loading ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Account Tab --- */}
            {activeTab === "account" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <User size={24} className="text-indigo-600" />
                  <h2 className="text-2xl font-bold text-slate-800">ข้อมูลบัญชี</h2>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-800 mb-4">ข้อมูลส่วนตัว</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อที่แสดง (Display Name)</label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {/* ถ้าอยากให้แก้ชื่อจริง-นามสกุลจริงด้วย */}
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อจริง</label>
                            <input
                              type="text"
                              value={userData.firstName}
                              onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">นามสกุล</label>
                            <input
                              type="text"
                              value={userData.lastName}
                              onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">เบอร์โทรศัพท์</label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-indigo-400"
                      >
                        <Save size={18} />
                        {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-800 mb-2">โซนอันตราย</h3>
                    <p className="text-sm text-red-600 mb-4">
                      การลบบัญชีจะไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร
                    </p>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-red-400"
                    >
                      <Trash2 size={18} />
                      {loading ? "กำลังดำเนินการ..." : "ลบบัญชี"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;