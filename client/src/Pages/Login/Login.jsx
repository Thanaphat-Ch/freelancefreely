import { useState } from "react"
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Input from "../../Components/Input"
import api from "../../api/axios"

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
    setApiError("")
  }

  const validate = () => {
    const err = {}
    if (!formData.email) err.email = "กรุณากรอกอีเมล"
    if (!formData.password) err.password = "กรุณากรอกรหัสผ่าน"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }

    try {
      setLoading(true)
      const res = await api.post("/auth/login", formData)

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("profilePic", JSON.stringify(res.data.profilePic))
      const userRole = res.data.user.role; 

      if (userRole === "admin") {
         navigate("/admin/users");
      } else {
         navigate("/"); 
      }
    } catch (err) {
      const data = err.response?.data

      if (data?.code === "EMAIL_NOT_VERIFIED") {
        setApiError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ")
      } else {
        setApiError(data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div  className="flex flex-1 bg-[#0F172A] pb-12 p-4">
      <div className="w-full max-w-md mt-12 mx-auto bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="px-8 pt-8 pb-6  text-center">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          <LogIn size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">ยินดีต้อนรับ</h2>
        <p className="text-slate-500 text-sm">เข้าสู่ระบบเพื่อจัดการงานของคุณ</p>
      </div>

      {/* Form */}
      <div className="px-8 pb-8">
        {/* 🔴 API Error */}
        {apiError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="อีเมล" name="email" value={formData.email} onChange={handleChange} icon={Mail} error={errors.email} placeholder="name@example.com" />

          <Input label="รหัสผ่าน" name="password" value={formData.password} onChange={handleChange} icon={Lock} error={errors.password} placeholder="••••••••" passwordToggle />

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-xl font-bold text-white
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-700 hover:to-violet-700
              disabled:opacity-70"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
              สมัครสมาชิกฟรี
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default LoginPage
