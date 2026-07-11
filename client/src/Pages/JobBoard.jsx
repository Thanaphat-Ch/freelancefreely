import React, { useEffect, useState } from "react"
import { Search, MapPin, Briefcase, Filter, DollarSign, Clock, ChevronDown, Bell, Menu, X, Star, Zap } from "lucide-react"
import api from "../api/axios"
import { JobCard } from "../Components/Card"
import Input from "../Components/Input"
import Swal from "sweetalert2"

const HeroSection = ({ searchKeyword, setSearchKeyword, selectedType, setSelectedType, selectedCategory, setSelectedCategory, selectedProvince, setSelectedProvince, onSearch, onReset }) => (
  <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
    </div>
    <div className="relative max-w-7xl mx-2 sm:mx-16 px-4 sm:px-6 lg:px-24 py-16">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3">บอร์ดประกาศงาน</h1>
      <p className="text-slate-300 mb-8 text-md sm:text-lg md:text-xl">ผู้ว่าจ้างโพสต์งานเพื่อหาคนที่ใช่ ฟรีแลนซ์เลือกงานที่สนใจ</p>
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-[2px] rounded-3xl shadow-2xl ">
        <div className="bg-transparent rounded-3xl flex flex-col md:flex-row gap-3 p-3">
          {/* <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="w-full md:flex-[3] bg-white rounded-full px-4 py-3 text-gray-800 focus:outline-none" placeholder="ค้นหางาน..." /> */}
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full md:flex-[1] bg-white rounded-full px-4 py-3 text-gray-800 focus:outline-none">
            <option value="">ลักษณะการจ้าง</option>
            <option value="freelance">ฟรีแลนซ์</option>
            <option value="contract">สัญญาจ้าง</option>
            <option value="part-time">พาร์ทไทม์</option>
            <option value="full-time">งานประจำ</option>
          </select>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full md:flex-[1] bg-white rounded-full px-4 py-3 text-gray-800 focus:outline-none">
            <option value="">ค้นหาหมวดหมู่งาน</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Frontend Specialist">Frontend Specialist</option>
            <option value="Mobile Developer">Mobile Developer</option>
            <option value="DevOps & Cloud">DevOps & Cloud</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="UI/UX DesignerMobile Application Developer">Mobile Application Developer</option>
            <option value="Software Developer / Software Engineer">Software Developer / Software Engineer</option>
            <option value="Game Developer">Game Developer</option>
            <option value="Data Developer / Data Engineer">Data Developer / Data Engineer</option>
            <option value="AI / Machine Learning Developer">AI / Machine Learning Developer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Cloud Engineer">Cloud Engineer</option>
            <option value="Database Developer">Database Developer</option>
            <option value="QA / Software Tester">QA / Software Tester</option>
            <option value="Embedded Systems Developer">Embedded Systems Developer</option>
            <option value="IoT Developer">IoT Developer</option>
            <option value="Blockchain Developer">Blockchain Developer</option>
            <option value="System Engineer">System Engineer</option>
            <option value="Cyber Security Specialist">Cyber Security Specialist</option>
            <option value="Penetration Tester (Ethical Hacker)">Penetration Tester (Ethical Hacker)</option>
            <option value="System Analyst (SA)">System Analyst (SA)</option>
            <option value="Technical Project Manager">Technical Project Manager</option>
            <option value="Product Owner (PO)">Product Owner (PO)</option>
            <option value="WordPress / CMS Developer">WordPress / CMS Developer</option>
            <option value="E-commerce Developer (Shopify/Magento)">E-commerce Developer (Shopify/Magento)</option>
            <option value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</option>
            <option value="AR / VR Developer">AR / VR Developer</option>
          </select>
          {/* <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full md:flex-[1] bg-white rounded-full px-4 py-3 text-gray-800 focus:outline-none">
            <option value="">จังหวัด</option>
          </select> */}
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={onSearch} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-slate-800 transition">
              ค้นหา
            </button>
            <button onClick={onReset} className="flex-1 md:flex-none border border-white text-white px-6 py-3 rounded-full hover:bg-white/10 transition">
              ล้าง
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PostJobModal = ({ onClose }) => {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    businessType: "",
    rate: "",
    deadline: "",
    endPost: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
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
    // if (!form.deadline) newErrors.deadline = "กรุณาเลือกวันส่งมอบงาน"
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
      Swal.fire("success!", "ส่งข้อเสนอเรียบร้อย 🎉", "success")
      onClose()
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", "เกิดข้อผิดพลาดไม่สามารถsubmitได้", "error")
      console.error(err)
    }
  }
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white flex flex-col text-sm rounded-3xl w-full max-w-2xl m-4 p-6 sm:p-8 shadow-2xl max-h-[70vh] sm:max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">ประกาศงานใหม่</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <Input label="หัวข้องาน" name="title" value={form.title} onChange={handleChange} placeholder="เช่น Fullstack Developer" error={errors.title} />
          <Input as="textarea" label="รายละเอียดงาน" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="อธิบายรายละเอียดงาน" error={errors.description} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              as="select"
              label="ประเภทจ้างงาน"
              name="type"
              value={form.type}
              error={errors.type}
              onChange={handleChange}
              options={[
                { value: "freelance", label: "ฟรีแลนซ์" },
                { value: "contract", label: "สัญญาจ้าง" },
                { value: "part-time", label: "พาร์ทไทม์" },
                { value: "full-time", label: "งานประจำ" },
              ]}
            />
            <Input
              as="select"
              label="หมวดหมู่งาน"
              name="category"
              value={form.category}
              error={errors.category}
              onChange={handleChange}
              options={[
                { value: "Full Stack Developer", label: "Full Stack Developer" },
                { value: "Frontend Specialist", label: "Frontend Specialist" },
                { value: "Backend Engineer", label: "Backend Engineer" },
                { value: "Mobile Developer", label: "Mobile Developer" },
                { value: "Mobile Application Developer", label: "Mobile Application Developer" },
                { value: "DevOps & Cloud", label: "DevOps & Cloud" },
                { value: "UI/UX Designer", label: "UI/UX Designer" },
                { value: "Software Developer / Software Engineer", label: "Software Developer / Software Engineer" },
                { value: "Game Developer", label: "Game Developer" },
                { value: "Data Developer / Data Engineer", label: "Data Developer / Data Engineer" },
                { value: "AI / Machine Learning Developer", label: "AI / Machine Learning Developer" },
                { value: "DevOps Engineer", label: "DevOps Engineer" },
                { value: "Cloud Engineer", label: "Cloud Engineer" },
                { value: "Database Developer", label: "Database Developer" },
                { value: "QA / Software Tester", label: "QA / Software Tester" },
                { value: "Embedded Systems Developer", label: "Embedded Systems Developer" },
                { value: "IoT Developer", label: "IoT Developer" },
                { value: "Blockchain Developer", label: "Blockchain Developer" },
                { value: "System Engineer", label: "System Engineer" },
                { value: "Cyber Security Specialist", label: "Cyber Security Specialist" },
                { value: "Penetration Tester (Ethical Hacker)", label: "Penetration Tester (Ethical Hacker)" },
                { value: "System Analyst (SA)", label: "System Analyst (SA)" },
                { value: "Technical Project Manager", label: "Technical Project Manager" },
                { value: "Product Owner (PO)", label: "Product Owner (PO)" },
                { value: "WordPress / CMS Developer", label: "WordPress / CMS Developer" },
                { value: "E-commerce Developer (Shopify/Magento)", label: "E-commerce Developer (Shopify/Magento)" },
                { value: "Site Reliability Engineer (SRE)", label: "Site Reliability Engineer (SRE)" },
                { value: "AR / VR Developer", label: "AR / VR Developer" }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="ประเภทธุรกิจ" name="businessType" value={form.businessType} onChange={handleChange} placeholder="เช่น Startup / Company" error={errors.businessType} />
            <Input type="text" label="เรท / งบประมาณ (บาท)"  name="rate"value={form.rate ? Number(form.rate).toLocaleString() : ''} onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                    if (!isNaN(rawValue)) {
                      handleChange({ target: { name: "rate", value: rawValue } });
                    }}} 
                  placeholder="เช่น 30,000" 
              error={errors.rate} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="ส่งมอบงานภายใน" name="deadline" value={form.deadline} onChange={handleChange} min={today} error={errors.deadline} />
            <Input type="date" label="สิ้นสุดประกาศ" name="endPost" value={form.endPost} onChange={handleChange} min={today} max={form.deadline} error={errors.endPost} />
          </div>

          <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg transition">
            ประกาศงาน
          </button>
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
    } finally {
      // setLoading(false);
    }
  }
  useEffect(() => {
    fetchJobs()
  }, [])
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
    if (selectedType) {
      filtered = filtered.filter((j) => j.type === selectedType)
    }
    if (selectedCategory) {
      filtered = filtered.filter((j) => j.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())))
    }
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
    <div className="flex flex-1 flex-col min-h-screen bg-slate-50 font-['Prompt',_sans-serif]">
      {/* Inject Font */}
      <style>
        {`
                /* Tailwind CSS classes ensure Inter is usually the default, but we enforce Prompt */
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');
                body { font-family: 'Prompt', sans-serif; }
                `}
      </style>

      <HeroSection
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      {isPostModalOpen && (
        <PostJobModal
          onClose={() => {
            ;(setIsPostModalOpen(false), fetchJobs())
          }}
        />
      )}

      <main className=" mx-2 sm:mx-16 px-4 sm:px-6 lg:px-24 py-14 pb-36">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <section className="flex-grow min-h-[400px]">
            {/* Controls & Sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">งานล่าสุด</h2>
                <p className="text-slate-500 text-base mt-1">
                  {isFilterApplied ? (
                    <>
                      พบ <span className="font-bold text-indigo-600">{filteredJobs.length}</span> งานที่ตรงกับตัวกรอง
                    </>
                  ) : (
                    <>
                      พบ <span className="font-bold text-indigo-600">{jobs.length}</span> งานที่คุณอาจสนใจ
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-32 md:w-48 flex items-center justify-between bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-slate-700 font-medium transition-colors shadow-sm">
                    <option value="latest">ล่าสุด</option>
                    <option value="rateLow">เรทน้อย → มาก</option>
                    <option value="rateHigh">เรทมาก → น้อย</option>
                  </select>
                </div>
                <button onClick={() => setIsPostModalOpen(true)} className="w-full sm:w-32 md:w-36 justify-center flex items-center bg-indigo-600 text-white hover:bg-indigo-800 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                  ประกาศงาน
                </button>
              </div>
            </div>

            {/* Job Grid */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <Filter size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบงานที่ตรงกับตัวกรอง</h3>
                <p className="text-slate-500 mb-6">ลองเปลี่ยนตัวกรองหรือล้างค่าตัวกรองเพื่อดูงานทั้งหมด</p>
                <button onClick={handleResetSearch} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  ล้างค่าตัวกรอง
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}

            {/* Load More */}
            {/* <div className="mt-12 text-center">
              <button className="px-10 py-3 bg-white border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:shadow-indigo-300/50 transform hover:scale-[1.01]">โหลดเพิ่มเติม</button>
            </div> */}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
