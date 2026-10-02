import { useEffect, useState, useMemo } from "react"
import { Search, User, Filter, X, ChevronDown, Check, SlidersHorizontal, RefreshCw, ArrowDown } from "lucide-react"
import api from "../api/axios"
import { FreelancerCard } from "../Components/Card"
import { Footer } from "../Components/footer";

const FREELANCER_CATEGORIES = [
  "Full Stack Developer",
  "Frontend Specialist",
  "Backend Engineer",
  "Mobile Developer",
  "DevOps & Cloud",
  "UI/UX Designer",
  "Software Developer / Software Engineer",
  "Game Developer",
  "Data Developer / Data Engineer",
  "AI / Machine Learning Developer",
  "Cloud Engineer",
  "Database Developer",
  "QA / Software Tester",
  "System Analyst (SA)",
  "Technical Project Manager",
  "Product Owner (PO)",
  "WordPress / CMS Developer",
  "E-commerce Developer",
  "Cyber Security Specialist"
]

const POPULAR_SKILLS = ["React", "Node.js", "Full Stack", "UI/UX", "Python", "DevOps", "Mobile Developer"]

export default function Main() {
  const [freelancers, setFreelancers] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Fetch ข้อมูล
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get("/freelancers")
        if (isMounted) setFreelancers(res.data || [])
      } catch (err) {
        if (isMounted) {
          console.error(err)
          setError("ไม่สามารถโหลดข้อมูลฟรีแลนซ์ได้ในขณะนี้")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])

  const filteredFreelancers = useMemo(() => {
    let result = freelancers.filter((f) => f.isActive !== false)

    if (selectedCategories.length > 0) {
      result = result.filter((f) => selectedCategories.includes(f.category))
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (f) =>
          f.title?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.skills?.some((s) => s.toLowerCase().includes(q))
      )
    }

    return [...result].sort((a, b) => {
      if (sortBy === "rateLow") return (a.rate || 0) - (b.rate || 0)
      if (sortBy === "rateHigh") return (b.rate || 0) - (a.rate || 0)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [freelancers, selectedCategories, searchTerm, sortBy])

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleReset = () => {
    setSelectedCategories([])
    setSearchTerm("")
  }

  const scrollToContent = () => {
    const el = document.getElementById("freelancer-list")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-1 flex-col font-['Prompt',sans-serif] antialiased">
      {/* 1. Hero Section แบบเต็มจอ (Full Viewport Height) */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center bg-[#070D18] text-white px-4 py-16 overflow-hidden border-b border-slate-800">
        {/* Glow & Backdrop Mesh Effects */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] background-size-[24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl w-full mx-auto text-center z-10 my-auto">

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.2] mb-6">
            หา <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-sky-400 to-cyan-300">ฟรีแลนซ์</span> ที่ใช่
            <br />สำหรับโปรเจกต์ของคุณ
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            รวบรวมผู้เชี่ยวชาญทั้ง Full Stack, DevOps, AI และ UI/UX ตรวจสอบผลงานและคุยตรงกับฟรีแลนซ์ได้ทันที
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl shadow-indigo-950/60 border border-white/20 flex items-center gap-2 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all">
              <div className="pl-3 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อตำแหน่ง หรือทักษะ เช่น React, Node.js..."
                className="w-full bg-transparent py-2.5 px-2 text-slate-900 text-sm sm:text-base placeholder-slate-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={scrollToContent}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm sm:text-base transition-all shrink-0 shadow-md shadow-indigo-600/30"
              >
                ค้นหา
              </button>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm">
            <span className="text-slate-400">ทักษะยอดนิยม:</span>
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  setSearchTerm(skill)
                  scrollToContent()
                }}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-400/50 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="relative z-10 mt-auto flex flex-col items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer pt-6"
        >
          <span>เลื่อนดูฟรีแลนซ์</span>
          <ArrowDown size={16} className="animate-bounce" />
        </button>
      </section>

      {/* 2. Main Content Section (แก้ปัญหาหน้าหดด้วย min-h-screen flex) */}
      <main id="freelancer-list" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-indigo-600" />
                  ทักษะและความเชี่ยวชาญ
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    ล้างค่า
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-[420px] overflow-y-auto space-y-0.5 pr-1 text-xs">
                {FREELANCER_CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat)
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition select-none ${
                        active ? "bg-indigo-50 text-indigo-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          active ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {active && <Check size={11} strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleCategory(cat)}
                        className="sr-only"
                      />
                      <span className="truncate">{cat}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Results Area (ล็อค min-h-[640px] ป้องกันหน้าหดตัว) */}
          <section className="flex-1 w-full min-w-0 flex flex-col min-h-[640px]">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 mb-6 border-b border-slate-200">
              <div className="text-sm text-slate-600">
                พบฟรีแลนซ์ทั้งหมด <span className="font-bold text-slate-900">{filteredFreelancers.length}</span> คน
              </div>

              <div className="flex items-center gap-2.5">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 shadow-sm"
                >
                  <Filter size={14} className="text-indigo-600" />
                  <span>ตัวกรอง</span>
                  {selectedCategories.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 font-bold rounded-full text-[10px]">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                  >
                    <option value="latest">เรียงลำดับ: ล่าสุด</option>
                    <option value="rateLow">เรท: น้อย → มาก</option>
                    <option value="rateHigh">เรท: มาก → น้อย</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Tag Badges */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                <span className="text-xs text-slate-400 mr-1">กำลังเลือก:</span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 bg-white border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 shadow-2xs"
                  >
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="hover:text-indigo-900 ml-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-700 underline ml-2"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}

            {/* Dynamic Content: Skeleton, Error, Empty, or Cards */}
            <div className="flex-1 flex flex-col justify-start">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-2/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="h-14 bg-slate-100 rounded-xl" />
                      <div className="h-4 bg-slate-200 rounded w-1/4 pt-2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white border border-red-100 rounded-3xl p-10 text-center min-h-[460px]">
                  <p className="text-sm font-medium text-red-600 mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    <RefreshCw size={13} /> ลองใหม่อีกครั้ง
                  </button>
                </div>
              ) : filteredFreelancers.length === 0 ? (
                /* Empty State: ขึงกล่องกว้างและสูงเต็มพื้นที่ ไม่ให้หน้าจอยุบ */
                <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center min-h-[460px]">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <User size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    ไม่พบฟรีแลนซ์ที่ตรงกับเงื่อนไข
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                    ลองตรวจสอบคำค้นหา หรือล้างตัวกรองความเชี่ยวชาญเพื่อดูรายชื่อฟรีแลนซ์ทั้งหมด
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                  >
                    รีเซ็ตตัวกรองทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredFreelancers.map((freelancer) => (
                    <FreelancerCard key={freelancer._id || freelancer.id} freelancer={freelancer} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* 3. Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-base text-slate-900">ตัวกรองทักษะ</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-1">
              {FREELANCER_CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat)
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer ${
                      active ? "bg-indigo-50 text-indigo-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                )
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                ล้างค่า
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
              >
                แสดง ({filteredFreelancers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}