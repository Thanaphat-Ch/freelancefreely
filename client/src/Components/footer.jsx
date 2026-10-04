import React from "react"
import { Link } from "react-router-dom"
import { BookOpen, MessageCircleMore, User, Settings, ShieldCheck, ArrowUpRight, Heart } from "lucide-react"

export const Footer = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))
    } catch {
      return null
    }
  })()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-900 overflow-hidden font-['Prompt',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-900">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img src="/icon.svg" alt="Logo" className="w-7 h-7 object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
              <span className="text-lg font-semibold tracking-tight text-white">FreelanceFreely</span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">พื้นที่รวมบริการงานคุณภาพ คัดสรรฟรีแลนซ์สายเทคโนโลยี ออกแบบ และซอฟต์แวร์ จ้างงานตรง ส่งมอบงานคล่องตัว และสื่อสารผ่านระบบได้อย่างมั่นใจ</p>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold text-slate-300">บริการ & แพลตฟอร์ม</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/jobboard" className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors group">
                  <span>กระดานงาน (Jobboard)</span>
                  <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-slate-200 transition-colors">
                  ค้นหาบริการฟรีแลนซ์
                </Link>
              </li>
              <li>
                <Link to="/guide" className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <BookOpen size={13} className="text-slate-500" />
                  <span>คู่มือการใช้งาน</span>
                </Link>
              </li>
              <li>
                <Link to={user ? "/chat" : "/login"} className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <MessageCircleMore size={13} className="text-slate-500" />
                  <span>ระบบแชทและติดต่อ</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold text-slate-300">{user ? "บัญชีของคุณ" : "เริ่มต้นใช้งาน"}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {user ? (
                <>
                  <li>
                    <Link to={user?.role === "admin" ? "/admin/adminprofile" : "/myprofile"} className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                      <User size={13} className="text-slate-500" />
                      <span>จัดการโปรไฟล์</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                      <Settings size={13} className="text-slate-500" />
                      <span>ตั้งค่าระบบความปลอดภัย</span>
                    </Link>
                  </li>
                  <li className="pt-1 text-slate-500 text-xs">
                    เข้าสู่ระบบโดย: <span className="text-slate-300 font-medium">{user.name || user.email}</span>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-slate-200 transition-colors">
                      เข้าสู่ระบบสมาชิก
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-slate-200 transition-colors">
                      ลงทะเบียนฟรีแลนซ์ / ผู้ว่าจ้าง
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold text-slate-300">ความปลอดภัยของระบบ</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                <ShieldCheck size={16} className="text-slate-400" />
                <span>การปกป้องข้อมูลผู้ใช้</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">การแจ้งเตือนและการสื่อสารเชื่อมต่อแบบเรียลไทม์ พร้อมการรักษาความปลอดภัยของบัญชี</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} FreelanceFreely. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/guide" className="hover:text-slate-300 transition-colors">
              วิธีใช้งาน
            </Link>
            <span className="text-slate-800">|</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              สร้างเพื่อคอมมูนิตี้คนทำงานอิสระ
              <Heart size={12} className="text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
