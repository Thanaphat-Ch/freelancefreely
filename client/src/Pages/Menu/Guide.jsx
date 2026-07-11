import React, { useState } from "react"
import {
  Briefcase,
  Search,
  MessageSquare,
  CheckCircle,
  Star,
  FileText,
  ShieldCheck,
  ChevronDown,
  User,
  Users,
  ArrowRight,
  Zap,
  Headphones,
  Lock,
  Home, // เพิ่มไอคอน Home
} from "lucide-react"
import { Link } from "react-router-dom"
import { useStartChat } from "../../hooks/useStartChat"

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("employer")
  const [openFaq, setOpenFaq] = useState(null)
  const { startChat } = useStartChat();

  // --- ข้อมูลฝั่งผู้ว่าจ้าง (วิธีที่ 1: ลงประกาศงาน) ---
  const employerPostJobSteps = [
    {
      id: 1,
      icon: FileText,
      title: "1. ลงประกาศงาน (Jobboard)",
      desc: "คุณสามารถประกาศงาน คลิกที่ปุ่ม (ประกาศงาน) เพื่อให้ฟรีแลนซ์สามารถเห็นงานของคุณ กรอกรายละเอียดงานที่คุณต้องการ ขอบเขตงาน และระยะเวลาที่คาดหวัง",
      color: "bg-blue-100 text-blue-600",
      link: "/JobBoard",
      linkText: "ไปหน้า Jobboard",
    },
    {
      id: 2,
      icon: Users,
      title: "2. เลือกฟรีแลนซ์",
      desc: "ดูโปรไฟล์และผลงานของคนที่มาเสนอในประกาศงานของคุณ งานที่คุณประกาศจะอยู่ในหน้าโปรไฟล์ เพื่อคัดเลือกคนที่ใช่",
      color: "bg-purple-100 text-purple-600",
      link: "/MyProfile",
      linkText: "ดูงานของฉัน",
    },
    {
      id: 3,
      icon: MessageSquare,
      title: "3. พูดคุยและเริ่มงาน",
      desc: "กดปุ่ม 'แชท' ในรายชื่อผู้สมัครเพื่อตกลงรายละเอียด หากพอใจให้กด 'จ้างงาน' เพื่อเริ่มระบบ",
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "4. ตรวจรับงาน",
      desc: "เมื่อฟรีแลนซ์ส่งงาน ตรวจสอบความเรียบร้อยแล้วกด 'จบงาน' พร้อมให้คะแนนรีวิว",
      color: "bg-green-100 text-green-600",
    },
  ]

  // --- ข้อมูลฝั่งผู้ว่าจ้าง (วิธีที่ 2: จ้างโดยตรง) *เพิ่มใหม่* ---
  const employerDirectHireSteps = [
    {
      id: "d1",
      icon: Home,
      title: "1. ค้นหาจากหน้าแรก",
      desc: "ไปที่หน้า Home หรือหน้าค้นหาฟรีแลนซ์ คุณจะเห็นรายชื่อผู้เชี่ยวชาญพร้อมเรทราคาเบื้องต้น",
      color: "bg-pink-100 text-pink-600",
      link: "/",
      linkText: "ไปหน้า Home",
    },
    {
      id: "d2",
      icon: User,
      title: "2. เลือกฟรีแลนซ์ที่สนใจ",
      desc: "คลิกที่การ์ดของฟรีแลนซ์ที่สนใจเพื่อดูรายละเอียดเชิงลึก ประวัติการทำงาน และผลงานที่ผ่านมา (Portfolio)",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "d3",
      icon: MessageSquare,
      title: "3. แชทหรือจ้างทันที",
      desc: "กดปุ่ม 'ทักแชทสอบถาม' เพื่อพูดคุยสอบถามรายละเอียดต่างๆก่อนเริ่มงาน หรือกดปุ่ม 'จ้างงานนี้' เพื่อส่งข้อเสนอให้ฟรีแลนซ์คนนั้นโดยตรง  เมื่อฟรีแลนซ์ตกลงรับงานจะแจ้งเตือนในไอคอนแจ้งเตือน",
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "4. ตรวจรับงาน",
      desc: "เมื่อฟรีแลนซ์ส่งงาน ตรวจสอบความเรียบร้อยแล้วกด 'จบงาน' พร้อมให้คะแนนรีวิว",
      color: "bg-green-100 text-green-600",
    },
  ]

  // --- ข้อมูลฝั่งฟรีแลนซ์ ---
  const freelancerSteps = [
    {
      id: 1,
      icon: Search,
      title: "1. ค้นหางานที่ชอบ",
      desc: "เลือกดูงานที่ตรงกับทักษะของคุณ จากหมวดหมู่ต่างๆ ที่มีให้เลือกมากมาย",
      color: "bg-pink-100 text-pink-600",
      link: "/jobboard",
      linkText: "ค้นหางานตอนนี้",
    },
    {
      id: 2,
      icon: FileText,
      title: "2. ยื่นข้อเสนอ",
      desc: "ส่งข้อเสนอและแนะนำตัวให้น่าสนใจ ได้ที่ปุ่ม 'สนใจงานนี้' ในหน้ารายละเอียดประกาศงานของผู้ว่าจ้าง ยิ่งโปรไฟล์ดี ยิ่งมีโอกาสได้งาน",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: 3,
      icon: Briefcase,
      title: "3. ลุยงานให้เต็มที่",
      desc: "เมื่อได้รับเลือก เริ่มทำงานตามที่ตกลงและอัปเดตความคืบหน้าผ่านแชท",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      id: 4,
      icon: Star,
      title: "4. สร้างผลงาน",
      desc: "ส่งมอบงานคุณภาพเพื่อรับคะแนนรีวิวจากผู้ว่าจ้าง ช่วยเพิ่มความน่าเชื่อถือ",
      color: "bg-emerald-100 text-emerald-600",
      link: "/MyProfile",
      linkText: "ดูโปรไฟล์ของฉัน",
    },
  ]

  const faqs = [
    { q: "มีค่าใช้จ่ายในการใช้งานหรือไม่?", a: "ไม่มีค่าใช้จ่าย! คุณสามารถลงประกาศงานหรือดูประกาศงานได้ฟรี" },
    { q: "จะมั่นใจในตัวฟรีแลนซ์/ผู้ว่าจ้างได้อย่างไร?", a: "เรามีระบบยืนยันตัวตนและระบบรีวิว (Rating) ที่ช่วยให้คุณตัดสินใจเลือกคนที่น่าเชื่อถือได้ง่ายขึ้น" },
    { q: "ถ้างานมีปัญหาทำอย่างไร?", a: "หากงานไม่ตรงตามตกลง หรือติดต่อคู่สัญญาไม่ได้ สามารถกดปุ่ม 'รายงาน' ที่หน้าโปรไฟล์ของผู้ที่กระทำความผิด และส่งคำร้องมาทางเราเพื่อให้ทีมงานช่วยตรวจสอบได้ทันที" },
  ]

  // Component สำหรับการ์ด Step เพื่อลดโค้ดซ้ำ
  const StepCard = ({ step, index }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute -bottom-6 -right-6 text-9xl font-black text-slate-50 opacity-50 select-none transition-colors group-hover:text-indigo-50/80">0{index + 1}</div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.color} shadow-sm`}>
        <step.icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3 relative z-10">{step.title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm flex-grow relative z-10">{step.desc}</p>
      {step.link && (
        <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
          <Link to={step.link} className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/link">
            {step.linkText}
            <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-0 font-sans flex-1">
      {/* 1. Header Section */}
      <div className="bg-slate-900 text-white pt-24 pb-32 rounded-b-[3rem] px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            เริ่มต้นใช้งานง่ายๆ <br /> ในไม่กี่ขั้นตอน
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 font-light">พื้นที่สำหรับหาคนช่วยงานและโชว์ฝีมือ เราออกแบบระบบให้ใช้งานง่าย เชื่อมต่อถึงกันได้ทันที</p>

          <div className="inline-flex bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-slate-700">
            <button
              onClick={() => setActiveTab("employer")}
              className={`px-6 sm:px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${activeTab === "employer" ? "bg-indigo-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
            >
              <Briefcase size={18} /> ผู้ว่าจ้าง
            </button>
            <button
              onClick={() => setActiveTab("freelancer")}
              className={`px-6 sm:px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${activeTab === "freelancer" ? "bg-pink-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
            >
              <User size={18} /> ฟรีแลนซ์
            </button>
          </div>
        </div>
      </div>

      {/* 2. Steps Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        {/* Logic การแสดงผลตาม Tab */}
        {activeTab === "employer" ? (
          <div className="space-y-16">
            {/* วิธีที่ 1: ลงประกาศงาน */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <h2 className="text-2xl font-bold text-slate-300">วิธีที่ 1: ลงประกาศงาน (JobBoard)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {employerPostJobSteps.map((step, index) => (
                  <StepCard key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>

            {/* วิธีที่ 2: จ้างโดยตรง */}
            <div className="relative pt-12 border-t border-slate-200">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-4 text-slate-400 font-medium text-sm">หรือ</div>
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <h2 className="text-2xl font-bold text-slate-800">วิธีที่ 2: จ้างฟรีแลนซ์โดยตรง (Home)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employerDirectHireSteps.map((step, index) => (
                  <StepCard key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // ฝั่งฟรีแลนซ์ (แสดงชุดเดียว)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freelancerSteps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Why Choose Us */}
      <div className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800">ทำไมต้องเลือกเรา?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">ปลอดภัย 100%</h3>
              <p className="text-slate-500 text-sm">ระบบยืนยันตัวตนที่รัดกุม ช่วยคัดกรองคุณภาพผู้ใช้งาน ไร้กังวลเรื่องการโกง</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">รวดเร็ว ทันใจ</h3>
              <p className="text-slate-500 text-sm">ระบบแชทและแจ้งเตือนแบบ Real-time ช่วยให้งานเดินหน้าได้อย่างรวดเร็ว</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">ข้อมูลส่วนตัว</h3>
              <p className="text-slate-500 text-sm">เราเก็บรักษาข้อมูลของคุณเป็นความลับ ตามมาตรฐานความปลอดภัยสูงสุด</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">คำถามที่พบบ่อย</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-200">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                {faq.q}
                <ChevronDown className={`transition-transform duration-300 text-slate-400 ${openFaq === idx ? "rotate-180 text-indigo-500" : ""}`} />
              </button>
              <div className={`transition-all duration-300 ease-in-out ${openFaq === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-5 pt-0 text-slate-500 leading-relaxed border-t border-slate-100/50">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Contact Support Box */}
        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">ยังไม่พบคำตอบที่ต้องการ?</h4>
              <p className="text-sm text-slate-500">ทีมงานของเราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</p>
            </div>
          </div>
          <button 
            onClick={() => startChat(`697627c6ef26b7b835929764`,'Super Admin','https://res.cloudinary.com/dxum5yvdm/image/upload/v1770793931/users/697627c6ef26b7b835929764/avatar.jpg')} 
            className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-500 hover:text-white transition-all shadow-sm whitespace-nowrap"
          >
            ติดต่อเรา
          </button>
        </div>
      </div>
    </div>
  )
}
