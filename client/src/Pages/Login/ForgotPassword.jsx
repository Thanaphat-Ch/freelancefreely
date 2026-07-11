import React, { useState } from "react"
import { Mail, ArrowLeft, CheckCircle, CreditCard, Phone, Calendar, Lock, KeyRound, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Input from "../../Components/Input" // ตรวจสอบ path ให้ถูกต้อง
import api from "../../api/axios"

const ForgotPassword = () => {
  const navigate = useNavigate()
  
  // Step Control: 1=Email, 2=Verify Identity, 3=Reset Password, 4=Success
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // --- Data States ---
  const [email, setEmail] = useState("")
  
  const [verifyData, setVerifyData] = useState({
    idCard: "",
    phone: "",
    birthDate: ""
  })
  
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  
  // Token ที่ได้จาก Backend เมื่อ Verify ผ่าน
  const [resetToken, setResetToken] = useState(null)

  // --- Formatters (ใส่ขีดเพื่อความสวยงาม) ---
  const formatIdCard = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 13)
    if (numbers.length <= 1) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 1)}-${numbers.slice(1)}`
    if (numbers.length <= 10) return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10)}`
    return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10, 12)}-${numbers.slice(12)}`
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 10)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
  }

  // --- Handlers ---

  // STEP 1: Submit Email
  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email) return setError("กรุณากรอกอีเมล")
    // ยังไม่ยิง API เช็ค Step 2 เลย (หรือจะยิงเช็คก่อนก็ได้ว่ามีเมลไหม แต่ flow นี้คือเช็คทีเดียวตอน step 2)
    setError("")
    setStep(2)
  }

  // STEP 2: Verify Identity
  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    const { idCard, phone, birthDate } = verifyData

    // ล้าง format (เอาขีดออก) เพื่อเช็คความยาวและส่ง API
    const rawIdCard = idCard.replace(/-/g, "")
    const rawPhone = phone.replace(/-/g, "")

    if (!rawIdCard || !rawPhone || !birthDate) {
      return setError("กรุณากรอกข้อมูลให้ครบทุกช่อง")
    }
    if (rawIdCard.length !== 13) {
      return setError("เลขบัตรประชาชนต้องมี 13 หลัก")
    }
    if (rawPhone.length !== 10) {
      return setError("เบอร์โทรศัพท์ต้องมี 10 หลัก")
    }

    try {
      setLoading(true)
      setError("")
      const res = await api.post("/auth/verify-identity", {
        email,
        idCard: rawIdCard, 
        phone: rawPhone,
        birthDate
      })

      // Backend ส่ง Token กลับมา เก็บไว้ใช้ Step หน้า
      setResetToken(res.data.resetToken)
      setStep(3)

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "ข้อมูลยืนยันตัวตนไม่ถูกต้อง")
    } finally {
      setLoading(false)
    }
  }

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError("รหัสผ่านยืนยันไม่ตรงกัน")
    }
    if (passwords.newPassword.length < 6) {
      return setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
    }
    // เพิ่ม Regex เช็คความยากรหัสผ่านได้ตรงนี้ถ้าต้องการ

    try {
      setLoading(true)
      setError("")

      // ยิง API: /auth/reset-password-flow (ตาม router ที่คุณกำหนด)
      await api.post("/auth/reset-password-flow", {
        token: resetToken,
        newPassword: passwords.newPassword
      })

      setStep(4) // Success

    } catch (err) {
      setError(err.response?.data?.message || "ลิงก์หมดอายุหรือเกิดข้อผิดพลาด กรุณาเริ่มใหม่")
    } finally {
      setLoading(false)
    }
  }

  // --- Render UI ---
  return (
    <div className="w-full max-w-lg mt-12 mx-auto bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-slate-100">
      
      {/* Header */}
      <div className="px-8 pt-8 pb-4 text-center">
        {step !== 4 && (
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
             {step === 3 ? <KeyRound size={22} /> : <Lock size={22} />}
          </div>
        )}
        
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          {step === 1 && "ลืมรหัสผ่าน"}
          {step === 2 && "ยืนยันความเป็นเจ้าของ"}
          {step === 3 && "ตั้งรหัสผ่านใหม่"}
          {step === 4 && "เรียบร้อย!"}
        </h2>
        
        <p className="text-slate-500 text-sm">
          {step === 1 && "ระบุอีเมลที่ต้องการเปลี่ยนรหัสผ่าน"}
          {step === 2 && `กรุณากรอกข้อมูลยืนยันสำหรับ ${email}`}
          {step === 3 && "กำหนดรหัสผ่านใหม่ของคุณ"}
        </p>
      </div>

      <div className="px-8 pb-8">
        
        {/* --- STEP 1: EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <Input
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
              }}
              icon={Mail}
              placeholder="name@example.com"
              error={error}
            />
            
            <button 
              type="submit" 
              className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center gap-2 transition-all"
            >
              ถัดไป <ChevronRight size={18}/>
            </button>
          </form>
        )}

        {/* --- STEP 2: VERIFY INFO --- */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <Input
                label="เลขบัตรประชาชน"
                value={verifyData.idCard}
                onChange={(e) => setVerifyData({
                    ...verifyData, 
                    idCard: formatIdCard(e.target.value) // ใส่ขีดอัตโนมัติ
                })}
                icon={CreditCard}
                maxLength={17} // 13 หลัก + 4 ขีด
                placeholder="x-xxxx-xxxxx-xx-x"
            />
            
            <Input
                label="เบอร์โทรศัพท์"
                value={verifyData.phone}
                onChange={(e) => setVerifyData({
                    ...verifyData, 
                    phone: formatPhone(e.target.value) // ใส่ขีดอัตโนมัติ
                })}
                icon={Phone}
                maxLength={12} // 10 หลัก + 2 ขีด
                placeholder="xxx-xxx-xxxx"
            />
            
            <Input
                label="วันเดือนปีเกิด"
                type="date"
                value={verifyData.birthDate}
                onChange={(e) => setVerifyData({...verifyData, birthDate: e.target.value})}
                icon={Calendar}
            />

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center border border-red-100">{error}</div>}

            <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(""); }} 
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    กลับ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white
                      bg-indigo-600 hover:bg-indigo-700
                      disabled:opacity-70 transition-all shadow-lg shadow-indigo-200"
                >
                  {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบข้อมูล"}
                </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: RESET PASSWORD --- */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <Input
              label="รหัสผ่านใหม่"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              icon={Lock}
              placeholder="••••••••"
              passwordToggle={true} 
            />

            <Input
              label="ยืนยันรหัสผ่านใหม่"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              icon={CheckCircle}
              placeholder="••••••••"
              passwordToggle={true}
            />

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-white
                bg-gradient-to-r from-emerald-500 to-teal-600
                hover:from-emerald-600 hover:to-teal-700
                disabled:opacity-70 shadow-lg shadow-emerald-200 transition-all"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนรหัส"}
            </button>
          </form>
        )}

        {/* --- STEP 4: SUCCESS --- */}
        {step === 4 && (
          <div className="text-center animate-in fade-in zoom-in duration-300 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
            <p className="text-slate-600 text-sm mt-2">
              สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
            </p>
            <Link 
                to="/login" 
                className="block w-full mt-8 py-3.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        )}

        {/* Footer Link */}
        {step !== 4 && (
            <div className="mt-8 text-center pt-6 border-t border-slate-50">
                 <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} />
                    ยกเลิกรายการ
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword