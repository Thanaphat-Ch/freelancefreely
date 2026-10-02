import React, { useEffect, useState } from "react"
import { Search, MapPin, Briefcase, Filter, DollarSign, Clock, ChevronDown, Bell, Menu, X, Star, Zap } from "lucide-react"
import api from "../api/axios"
import { JobCard } from "../Components/Card"
import Input from "../Components/Input"
import Swal from "sweetalert2"
import { Footer } from "../Components/footer"

const HeroSection = ({ selectedType, setSelectedType, selectedCategory, setSelectedCategory, onSearch, }) => (
  <div className="bg-slate-950 text-white py-16 sm:py-20 border-b border-slate-900">
  <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">บอร์ดประกาศงาน</h1>
      <p className="text-slate-400 mb-10 text-base sm:text-lg">
        พื้นที่สำหรับผู้ว่าจ้างค้นหาคนทำงานที่ใช่ และฟรีแลนซ์เลือกโปรเจกต์ที่ตรงกับความเชี่ยวชาญ
      </p>
    </div>

    {/* เพิ่ม max-w-4xl เพื่อให้กล่องพอดี ไม่ยืดกว้างเกินไป */}
    <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col md:flex-row gap-2.5 max-w-4xl">
      <select 
        value={selectedType} 
        onChange={(e) => setSelectedType(e.target.value)} 
        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer"
      >
        <option value="">ลักษณะการจ้างทั้งหมด</option>
        <option value="freelance">ฟรีแลนซ์</option>
        <option value="contract">สัญญาจ้าง</option>
        <option value="part-time">พาร์ทไทม์</option>
        <option value="full-time">งานประจำ</option>
      </select>

      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)} 
        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer"
      >
        <option value="">หมวดหมู่งานทั้งหมด</option>
        <option value="Full Stack Developer">Full Stack Developer</option>
        <option value="Frontend Specialist">Frontend Specialist</option>
        <option value="Mobile Developer">Mobile Developer</option>
        <option value="DevOps & Cloud">DevOps & Cloud</option>
        <option value="UI/UX Designer">UI/UX Designer</option>
        <option value="Software Developer / Software Engineer">Software Developer / Software Engineer</option>
        <option value="Game Developer">Game Developer</option>
        <option value="Data Developer / Data Engineer">Data Developer / Data Engineer</option>
        <option value="AI / Machine Learning Developer">AI / Machine Learning Developer</option>
        <option value="DevOps Engineer">DevOps Engineer</option>
        <option value="Cloud Engineer">Cloud Engineer</option>
        <option value="Database Developer">Database Developer</option>
        <option value="QA / Software Tester">QA / Software Tester</option>
        <option value="System Analyst (SA)">System Analyst (SA)</option>
        <option value="Technical Project Manager">Technical Project Manager</option>
        <option value="Cyber Security Specialist">Cyber Security Specialist</option>
      </select>

      {/* ปุ่มค้นหาเดี่ยวๆ โดยใช้ shrink-0 เพื่อไม่ให้ปุ่มโดนบีบ */}
      <button 
        onClick={onSearch} 
        className="w-full md:w-auto md:px-10 shrink-0 bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 transition"
      >
        ค้นหา
      </button>
    </div>
  </div>
</div>
)

const PostJobModal = ({ onClose }) => {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: "", description: "", type: "", category: "", businessType: "", rate: "", deadline: "", endPost: "",
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  
  const validateForm = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = "กรุณากรอกชื่องาน"
    if (!form.description.trim()) newErrors.description = "กรุณากรอกรายละเอียดงาน"
    if (!form.type) newErrors.type = "กรุณาเลือกประเภทจ้างงาน"
    if (!form.category) newErrors.category = "กรุณาเลือกหมวดหมู่งาน"
    if (!form.businessType.trim()) newErrors.businessType = "กรุณากรอกประเภทธุรกิจ"
    if (!form.rate) {
      newErrors.rate = "กรุณากรอกงบประมาณ"
    } else if (Number(form.rate) <= 0) {
      newErrors.rate = "งบประมาณต้องมากกว่า 0"
    }
    if (!form.endPost) newErrors.endPost = "กรุณาเลือกวันสิ้นสุดประกาศ"
    if (form.deadline && form.endPost && form.endPost > form.deadline) {
      newErrors.endPost = "วันสิ้นสุดประกาศต้องน้อยกว่าวันส่งมอบงาน"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    try {
      await api.post("/jobs", form)
      Swal.fire("สำเร็จ!", "ประกาศงานเรียบร้อยแล้ว", "success")
      onClose()
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถประกาศงานได้", "error")
      console.error(err)
    }
  }
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col text-slate-800 rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">ประกาศงานใหม่</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <Input label="หัวข้องาน" name="title" value={form.title} onChange={handleChange} placeholder="เช่น Fullstack Developer" error={errors.title} />
          <Input as="textarea" label="รายละเอียดงาน" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="อธิบายขอบเขตและรายละเอียดงานที่ต้องการ" error={errors.description} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input as="select" label="ประเภทจ้างงาน" name="type" value={form.type} error={errors.type} onChange={handleChange}
              options={[
                { value: "freelance", label: "ฟรีแลนซ์" },
                { value: "contract", label: "สัญญาจ้าง" },
                { value: "part-time", label: "พาร์ทไทม์" },
                { value: "full-time", label: "งานประจำ" },
              ]} />
            <Input as="select" label="หมวดหมู่งาน" name="category" value={form.category} error={errors.category} onChange={handleChange}
              options={[
                { value: "Full Stack Developer", label: "Full Stack Developer" },
                { value: "Frontend Specialist", label: "Frontend Specialist" },
                { value: "Backend Engineer", label: "Backend Engineer" },
                { value: "UI/UX Designer", label: "UI/UX Designer" },
                { value: "Mobile Developer", label: "Mobile Developer" },
              ]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="ประเภทธุรกิจ" name="businessType" value={form.businessType} onChange={handleChange} placeholder="เช่น Startup / E-Commerce" error={errors.businessType} />
            <Input type="text" label="งบประมาณ (บาท)" name="rate" 
              value={form.rate ? Number(form.rate).toLocaleString() : ''} 
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                if (!isNaN(rawValue)) handleChange({ target: { name: "rate", value: rawValue } });
              }} 
              placeholder="เช่น 30,000" error={errors.rate} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="ส่งมอบงานภายใน (ถ้ามี)" name="deadline" value={form.deadline} onChange={handleChange} min={today} error={errors.deadline} />
            <Input type="date" label="สิ้นสุดประกาศ" name="endPost" value={form.endPost} onChange={handleChange} min={today} max={form.deadline} error={errors.endPost} />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition">ยกเลิก</button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-xs">ประกาศงาน</button>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  const [filteredJobs, setFilteredJobs] = useState([])
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [jobs, setJobs] = useState([])
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [sortBy, setSortBy] = useState("latest")

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs?status=open")
      setJobs(res.data)
      setFilteredJobs(res.data)
    } catch (err) {
      console.error("Failed to fetch jobs", err)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  useEffect(() => {
    let sorted = [...filteredJobs]
    if (sortBy === "latest") sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === "rateLow") sorted.sort((a, b) => a.rate - b.rate)
    if (sortBy === "rateHigh") sorted.sort((a, b) => b.rate - a.rate)
    setFilteredJobs(sorted)
  }, [sortBy])

  const handleSearch = () => {
    let filtered = [...jobs]
    if (searchKeyword) {
      filtered = filtered.filter((j) => j.title.toLowerCase().includes(searchKeyword.toLowerCase()) || j.tags.some((t) => t.toLowerCase().includes(searchKeyword.toLowerCase())))
    }
    if (selectedType) filtered = filtered.filter((j) => j.type === selectedType)
    if (selectedCategory) filtered = filtered.filter((j) => j.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())))
    
    setFilteredJobs(filtered)
    setIsFilterApplied(true)
  }

  const handleResetSearch = () => {
    setSearchKeyword("")
    setSelectedType("")
    setSelectedCategory("")
    setSelectedProvince("")
    setFilteredJobs(jobs)
    setIsFilterApplied(false)
  }

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-[#F8FAFC] font-['Prompt',_sans-serif] antialiased">
      <HeroSection
        searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince}
        onSearch={handleSearch} onReset={handleResetSearch}
      />

      {isPostModalOpen && <PostJobModal onClose={() => { setIsPostModalOpen(false); fetchJobs(); }} />}

      {/* Main Container - Full width centered */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ประกาศงานล่าสุด</h2>
            <p className="text-slate-500 text-sm mt-1">
              {isFilterApplied ? `พบ ${filteredJobs.length} งานที่ตรงกับตัวกรอง` : `พบ ${jobs.length} งานที่คุณอาจสนใจ`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto bg-white border border-slate-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-sm text-slate-700 font-medium transition-colors shadow-xs cursor-pointer">
              <option value="latest">เรียงล่าสุด</option>
              <option value="rateLow">งบประมาณ: น้อยไปมาก</option>
              <option value="rateHigh">งบประมาณ: มากไปน้อย</option>
            </select>
            <button onClick={() => setIsPostModalOpen(true)} className="w-full sm:w-auto shrink-0 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-xs">
              ลงประกาศงาน
            </button>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Filter size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">ไม่พบงานที่ตรงกับตัวกรอง</h3>
            <p className="text-sm text-slate-500 mb-5">ลองเปลี่ยนเงื่อนไขหรือล้างตัวกรองเพื่อดูงานทั้งหมดที่มีในระบบ</p>
            <button onClick={handleResetSearch} className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
              ล้างค่าตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App