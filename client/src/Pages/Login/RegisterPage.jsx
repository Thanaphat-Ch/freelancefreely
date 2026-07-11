import { useState } from "react"
import { User, Mail, Lock, Phone, CreditCard, MapPin, ShieldCheck, CheckCircle, ArrowRight, X ,Tag } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Input from "../../Components/Input" // ตรวจสอบ path ให้ถูกต้อง
import api from "../../api/axios" // ตรวจสอบ path ให้ถูกต้อง
import Swal from "sweetalert2"


// --- ส่วนประกอบ Modal แสดงผลเมื่อสมัครสำเร็จ ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">ลงทะเบียนสำเร็จ!</h3>
        <p className="text-center text-slate-500 mb-6">บัญชีของคุณถูกสร้างเรียบร้อยแล้ว</p>
        <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          เข้าสู่ระบบ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

// --- ส่วนประกอบ Modal เงื่อนไขการใช้งาน ---
const TermsModal = ({ isOpen, onAccept, onCancel }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-inherit">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-900">เงื่อนไขการใช้งาน</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-5 custom-scrollbar">
          <p className="text-slate-500 italic">โปรดอ่านและทำความเข้าใจเงื่อนไขก่อนใช้งาน หากท่านตกลงใช้งาน ถือว่าท่านยอมรับเงื่อนไขทั้งหมดนี้</p>

         <div className="space-y-4">
          <section>
            <h4 className="font-bold text-slate-900">1. การยอมรับการสมัครสมาชิก</h4>
            <p>ผู้ใช้งานตกลงปฏิบัติตามเงื่อนไขการใช้งานและนโยบายที่เกี่ยวข้องทั้งหมด หากไม่ยอมรับเงื่อนไขทางเราจะไม่รับผิดชอบความเสียหายทุกกรณี</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">2. ข้อมูลที่กรอกในระบบ</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>ผู้ใช้งานต้องมีอายุไม่ต่ำกว่า 18 ปี</li>
              <li>ข้อมูลที่ลงทะเบียนต้องเป็นข้อมูลจริง ถูกต้อง และเป็นปัจจุบัน</li>
              <li>ผู้ใช้งานต้องรับผิดชอบต่อการใช้งานบัญชีของตนเอง</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">3. การใช้งานแพลตฟอร์ม</h4>
            <p>ตกลงใช้งานเพื่อค้นหางานหรือรับสมัครงานอย่างสุจริต ไม่โพสต์ข้อมูลเท็จ หลอกลวง หรือใช้แพลตฟอร์มเพื่อการฉ้อโกง สแปม และแสวงหาประโยชน์โดยมิชอบ</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">4. เนื้อหาและข้อมูล</h4>
            <p>ผู้ใช้งานเป็นผู้รับผิดชอบต่อข้อมูลที่เผยแพร่ แพลตฟอร์มสงวนสิทธิ์ในการลบหรือระงับเนื้อหาที่ไม่เหมาะสมโดยไม่ต้องแจ้งล่วงหน้า</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">5. ความสัมพันธ์ระหว่างผู้ใช้งาน</h4>
            <p>แพลตฟอร์มเป็นเพียงตัวกลางเชื่อมต่อ ไม่รับประกันการได้งาน การจ้างงาน หรือคุณภาพของนายจ้างและลูกจ้าง</p>
          </section>

          {/* ส่วนนโยบายข้อมูลส่วนบุคคล (PDPA) */}
          <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-indigo-600 mb-2">6. นโยบายข้อมูลส่วนบุคคล (PDPA)</h4>
            <div className="text-xs space-y-2 text-slate-600">
              <p>• <strong>ข้อมูลที่เก็บ:</strong> ชื่อ-นามสกุล, อีเมล, เบอร์โทร, เลขบัตรประชาชน, ประวัติการทำงาน และพอร์ตโฟลิโอ</p>
              <p>• <strong>วัตถุประสงค์:</strong> เพื่อใช้ในการเชื่อมต่อระหว่างผู้ใช้งาน และส่งแจ้งเตือนข้อมูลสำคัญจากระบบ</p>
              <p>• <strong>การเปิดเผยข้อมูล:</strong> จะเปิดเผยโปรไฟล์ให้กับผู้ว่าจ้างบนแพลตฟอร์มเท่านั้น และจะไม่มีการขายข้อมูลให้บุคคลภายนอกเด็ดขาด</p>
              <p>• <strong>สิทธิ์ของคุณ:</strong> ท่านมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลได้ผ่านเมนู "ตั้งค่าบัญชี"</p>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">7. การระงับหรือยกเลิกบัญชี</h4>
            <p>สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีทันที หากพบพฤติกรรมฉ้อโกง ฟอกเงิน หรือส่งผลเสียต่อความปลอดภัยส่วนรวม</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">8. การเปลี่ยนแปลงเงื่อนไข</h4>
            <p>แพลตฟอร์มขอสงวนสิทธิ์ในการแก้ไขเงื่อนไข โดยจะแจ้งให้ทราบผ่านหน้าเว็บไซต์หรือแอปพลิเคชัน</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">9. ข้อจำกัดความรับผิด</h4>
            <p>ไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้งานหรือการติดต่อสื่อสารกันระหว่างผู้ใช้งาน</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">10. การส่งมอบงานและลิขสิทธิ์</h4>
            <p>เมื่อมีการชำระเงินครบถ้วน ลิขสิทธิ์ในผลงานจะตกเป็นของผู้ว่าจ้าง เว้นแต่จะมีการตกลงเป็นอย่างอื่น</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900">11. ภาษีและการหัก ณ ที่จ่าย</h4>
            <p>ฟรีแลนซ์มีหน้าที่รับผิดชอบภาษีเงินได้ด้วยตนเอง แพลตฟอร์มเป็นเพียงตัวกลางและไม่ได้มีสถานะเป็นนายจ้าง</p>
          </section>
        </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
            ยกเลิก
          </button>
          <button onClick={onAccept} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">
            ยอมรับและสมัครสมาชิก
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Component หลัก ---
export default function RegisterPage() {
  const navigate = useNavigate() // ประกาศแค่ครั้งเดียวตรงนี้

  const [formData, setFormData] = useState({
    prefix: "",
    firstName: "",
    lastName: "",
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    idCard: "",
    address: "",
    role: "",
    password: "",
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [success, setSuccess] = useState(false)

  // --- ฟังก์ชันช่วยเหลือสำหรับการตรวจสอบ (Validation Helpers) ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function isValidThaiID(id) {
    if (!/^\d{13}$/.test(id)) return false
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id[i]) * (13 - i)
    }
    const check = (11 - (sum % 11)) % 10
    return check === parseInt(id[12])
  }

  function isStrongPassword(password) {
    // อย่างน้อย 6 ตัว, มีตัวเล็ก, ตัวใหญ่, ตัวเลข
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)
  }

  function isAge18Plus(birthDate) {
    if (!birthDate) return false
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 18
  }

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    
    // ลบ Error ทันทีที่ผู้ใช้เริ่มพิมพ์แก้ไข
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }))

    // Real-time Validation บางตัว
    if (name === "birthDate") {
      if (!isAge18Plus(value)) setErrors((prev) => ({ ...prev, birthDate: "ต้องมีอายุอย่างน้อย 18 ปี" }))
      else setErrors((prev) => ({ ...prev, birthDate: "" }))
    }
    if (name === "password") {
      if (!isStrongPassword(value)) setErrors((prev) => ({ ...prev, password: "ต้องมีพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข อย่างน้อย 6 ตัว" }))
      else setErrors((prev) => ({ ...prev, password: "" }))
    }
  }

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

  const handleIdCardChange = (e) => {
    const formatted = formatIdCard(e.target.value)
    setFormData((p) => ({ ...p, idCard: formatted }))
    if (errors.idCard) setErrors((p) => ({ ...p, idCard: "" }))
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData((p) => ({ ...p, phone: formatted }))
    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }))
  }

  // --- ฟังก์ชันตรวจสอบทั้งหมด (Validate) ---
  const validate = () => {
    const e = {}
    if (!formData.prefix) e.prefix = "เลือกคำนำหน้า"
    if (!formData.firstName) e.firstName = "กรอกชื่อ"
    if (!formData.lastName) e.lastName = "กรอกนามสกุล"
    if (!formData.name) e.name = "กรอกชื่อโปรไฟล์"
    
    if (!formData.birthDate) e.birthDate = "เลือกวันเกิด"
    else if (!isAge18Plus(formData.birthDate)) e.birthDate = "ต้องมีอายุอย่างน้อย 18 ปี"
    
    if (!formData.email) e.email = "กรอกอีเมล"
    else if (!isValidEmail(formData.email)) e.email = "รูปแบบอีเมลไม่ถูกต้อง"

    if (!formData.phone) e.phone = "กรอกเบอร์โทร"
    
    if (!formData.idCard) {
      e.idCard = "กรอกเลขบัตรประชาชน"
    } else {
      const cleanID = formData.idCard.replace(/-/g, "") // ลบขีดก่อนเช็ค
      if (!isValidThaiID(cleanID)) e.idCard = "เลขบัตรประชาชนไม่ถูกต้อง"
    }

    if (!formData.address) e.address = "กรอกที่อยู่"
    if (!formData.role) e.role = "เลือกประเภทผู้ใช้งาน"
    
    if (!formData.password) e.password = "กรอกรหัสผ่าน"
    else if (!isStrongPassword(formData.password)) e.password = "รหัสผ่านต้องมีพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข อย่างน้อย 6 ตัว"

    if (formData.password !== confirmPassword) e.confirmPassword = "รหัสผ่านไม่ตรงกัน"
    return e
  }

  // --- กดปุ่มสมัคร (ตรวจสอบ -> Alert -> Modal) ---
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 1. ตรวจสอบข้อมูล
    const v = validate()

    // 2. ถ้ามี Error (ข้อมูลไม่ครบ/ไม่ถูก)
    if (Object.keys(v).length > 0) {
      setErrors(v) // แสดงตัวหนังสือสีแดง
      
      // แสดง Popup แจ้งเตือน
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ถูกต้อง',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้องตามเงื่อนไข (ตัวหนังสือสีแดง)',
        confirmButtonText: 'ตกลง'
      })
      
      return // หยุดการทำงานทันที (ไม่เปิดเงื่อนไข)
    }

    // 3. ถ้าข้อมูลถูกต้องหมด ให้เปิด Modal เงื่อนไข
    setShowTerms(true) 
  }

  // --- กดปุ่มยอมรับเงื่อนไข (ส่งข้อมูลไป Server) ---
  const handleFinalSubmit = async () => {
    setShowTerms(false)
    setLoading(true)
    try {
      // เตรียมข้อมูล (ลบขีดออกจากเบอร์และบัตรประชาชน)
      const payload = { ...formData, 
        phone: formData.phone.replace(/-/g, ""), 
        idCard: formData.idCard.replace(/-/g, "") 
      }
      
      await api.post("/auth/register", payload)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      Swal.fire({ 
        icon: 'error',
        title: 'สมัครไม่สำเร็จ',
        text: err.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setLoading(false)
    }
  }

  const maxBirthDate = new Date()
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18)
  const maxDateStr = maxBirthDate.toLocaleDateString("en-CA")

  return (
    <div className="flex flex-1 bg-[#0F172A] pb-12">
      <div className="max-w-md mx-auto bg-white mt-12 rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center mb-2">สมัครสมาชิก</h2>
        <p className="text-center text-slate-500 mb-8">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input as="select" label="คำนำหน้า" name="prefix" value={formData.prefix} onChange={handleChange} error={errors.prefix} className="max-w-[120px]"
            options={[
              { value: "นาย", label: "นาย" },
              { value: "นาง", label: "นาง" },
              { value: "นางสาว", label: "นางสาว" },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="ชื่อ" name="firstName" value={formData.firstName} onChange={handleChange} icon={User} error={errors.firstName} />
            <Input label="นามสกุล" name="lastName" value={formData.lastName} onChange={handleChange} icon={User} error={errors.lastName} />
          </div>
          <Input label="ชื่อผู้ใช้" name="name" value={formData.name} onChange={handleChange} icon={Tag} error={errors.name} placeholder="เช่น ชื่อเล่น หรือ นามแฝง"/>

          <Input label="วันเกิด" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} max={maxDateStr} error={errors.birthDate} />

          <Input label="อีเมล" name="email" value={formData.email} onChange={handleChange} icon={Mail} error={errors.email} />

          <Input label="เบอร์โทร" name="phone" value={formData.phone} onChange={handlePhoneChange} icon={Phone} error={errors.phone} />

          <Input label="เลขบัตรประชาชน" name="idCard" value={formData.idCard} onChange={handleIdCardChange} icon={CreditCard} error={errors.idCard} />

          <Input as="textarea" label="ที่อยู่ปัจจุบัน" name="address" value={formData.address} onChange={handleChange} icon={MapPin} error={errors.address} />

          {/* <div>
            <label className="block text-sm font-semibold mb-2">ประเภทผู้ใช้งาน</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "employer", label: "ผู้ว่าจ้าง" },
                { value: "user", label: "ฟรีแลนซ์" },
              ].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: o.value }))}
                  className={`p-4 rounded-xl border text-sm font-semibold transition-all
                  ${formData.role === o.value ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-200 hover:border-indigo-400"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div> */}

          <Input label="รหัสผ่าน" name="password" value={formData.password} onChange={handleChange}  passwordToggle error={errors.password} />

          <Input label="ยืนยันรหัสผ่าน" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}  passwordToggle error={errors.confirmPassword} />

          <button type="submit" disabled={loading} className="w-full mt-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          มีบัญชีแล้ว?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>

      <TermsModal isOpen={showTerms} onCancel={() => setShowTerms(false)} onAccept={handleFinalSubmit} />
      <SuccessModal isOpen={success} onClose={() => setSuccess(false)} />
    </div>
  )
}

