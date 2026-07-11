import { useEffect, useState, useMemo } from "react"
import { Search, User, Filter, X } from "lucide-react"
import api from "../api/axios"
import { FreelancerCard } from "../Components/Card"

// --- Mock Data ---
const freelancerCategories = [
  { name: "Full Stack Developer", count: "" },
  { name: "Frontend Specialist", count: "" },
  { name: "Backend Engineer", count: "" },
  { name: "Mobile Developer", count: "" },
  { name: "DevOps & Cloud", count: "" },
  { name: "UI/UX Designer", count: "" },
  { name: "Mobile Application Developer", count: "" },
  { name: "Software Developer / Software Engineer", count: "" },
  { name: "Game Developer", count: "" },
  { name: "Data Developer / Data Engineer", count: "" },
  { name: "AI / Machine Learning Developer", count: "" },
  { name: "DevOps Engineer", count: "" },
  { name: "Cloud Engineer", count: "" },
  { name: "Database Developer", count: "" },
  { name: "QA / Software Tester", count: "" },
  { name: "Embedded Systems Developer", count: "" },
  { name: "IoT Developer", count: "" },
  { name: "Blockchain Developer", count: "" },
  { name: "System Engineer", count: "" },
  { name: "Cyber Security Specialist", count: "" },
  { name: "Penetration Tester (Ethical Hacker)", count: "" },
  { name: "System Analyst (SA)", count: "" },
  { name: "Technical Project Manager", count: "" },
  { name: "Product Owner (PO)", count: "" },
  { name: "WordPress / CMS Developer", count: "" },
  { name: "E-commerce Developer (Shopify/Magento)", count: "" },
  { name: "Site Reliability Engineer (SRE)", count: "" },
  { name: "AR / VR Developer", count: "" },
]

const FilterSection = ({ selectedCategories, onCategoryChange, onClearFilters, onApplyFilters }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24 transform translate-y-0 ">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
          <Filter size={20} className="text-indigo-600" /> ตัวกรอง
        </h3>
        <button onClick={onClearFilters} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          ล้างค่า
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8 h-[400px] overflow-y-auto">
        <h4 className="text-base font-semibold text-slate-900 mb-4">ทักษะ/ความเชี่ยวชาญ</h4>
        <ul className="space-y-3">
          {freelancerCategories.map((cat, idx) => (
            <li key={idx} className="flex items-center justify-between group cursor-pointer">
              <label className="flex items-center gap-3 w-full cursor-pointer">
                <input type="checkbox" checked={selectedCategories.includes(cat?.name)} onChange={() => onCategoryChange(cat?.name)} className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-shadow shadow-sm checked:shadow-indigo-300" />
                <span className="text-slate-700 text-sm group-hover:text-indigo-600 transition-colors font-medium">{cat?.name}</span>
              </label>
              {/* <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-semibold">{cat.count}</span> */}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onApplyFilters} className="w-full mt-8 bg-linear-to-r from-indigo-600 to-cyan-500 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-cyan-600 transition-all shadow-lg shadow-indigo-500/40 transform hover:scale-[1.01]">
        ใช้ตัวกรอง
      </button>
    </div>
  )
}

const HeroSection = ({ searchTerm, onSearchChange, onSearch }) => (
  <div className="bg-slate-950 text-white relative overflow-hidden border-b border-indigo-900/50 h-[550px] md:min-h-[670px]">
    {/* Background Mesh/Gradient Effect */}
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at center, #1E3A8A 0%, transparent 80%)" }}></div>
    <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-indigo-900/60 to-transparent pointer-events-none"></div>
    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 relative z-10 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
        หา <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">ฟรีแลนซ์</span>
        <br />
        ที่ใช่สำหรับโปรเจกต์ของคุณ
      </h1>
      <p className="text-slate-300 text-lg mb-12 max-w-3xl mx-auto">ค้นหาฟรีแลนซ์ที่มีทักษะและประสบการณ์ตรงกับความต้องการของคุณ เลือกจากผู้เชี่ยวชาญมากมายที่พร้อมทำงาน</p>

      {/* Search Bar */}
      <div className="bg-white p-1.5 md:p-3 rounded-full shadow-2xl shadow-indigo-900/50 max-w-3xl mx-auto flex items-center border-2 border-transparent focus-within:border-indigo-500 transition-all">
        <div className="pl-3 md:pl-5 text-slate-400 shrink-0">
          <Search size={18} className="md:w-[22px]" />
        </div>
        <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="ค้นหาฟรีแลนซ์..." className="grow p-2 md:p-3 text-slate-800 focus:outline-none bg-transparent text-sm md:text-base w-full" />
        <button onClick={onSearch} className="bg-indigo-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-bold hover:bg-indigo-700 transition-colors shrink-0">
          ค้นหา
        </button>
      </div>

      {/* Popular Skills */}
      {/* <div className="mt-8 flex items-center gap-3 justify-center flex-wrap text-sm">
        <span className="text-slate-400 font-medium">ทักษะยอดนิยม:</span>
        {["React", "Node.js", "UI/UX", "Python", "AWS", "Figma"].map((skill) => (
          <span key={skill} className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 cursor-pointer transition-colors border border-slate-700 font-medium hover:border-indigo-500">
            {skill}
          }</span>
        ))}
      </div> */}
    </div>
  </div>
)

// --- Main Page ---

const Main = () => {
  // State for Mobile Filter visibility
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState([])
  
  // ✅ 1. ยุบ State: เหลือแค่ 'freelancers' (Raw Data จาก API) และ 'filters' (ตัวแปรควบคุม)
  // ลบ filteredFreelancers และ isFilterApplied ออก
  const [freelancers, setFreelancers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")

  // ✅ 2. ปรับ `useEffect` สำหรับ Fetch ข้อมูลให้สมบูรณ์ขึ้น
  // เพิ่ม `loading` และ `error` state เพื่อจัดการ UX ตอน API ยังโหลดไม่เสร็จ
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get("/freelancers")
        setFreelancers(res.data)
      } catch (err) {
        console.error("โหลด freelancer ไม่สำเร็จ", err)
        setError("ไม่สามารถโหลดข้อมูลฟรีแลนซ์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setIsLoading(false);
      }
    }

    fetchFreelancers()
  }, []) // ยิง API แค่ครั้งเดียวตอน Mount

  // ✅ 3. หัวใจสำคัญ: ใช้ `useMemo` เพื่อคำนวณการกรอง (Filtering) และการเรียง (Sorting) ในตัวเดียว
  // ลดการใช้ useEffect ซ้ำซ้อนและทำให้ Performance ดีขึ้นมาก
  const displayFreelancers = useMemo(() => {
    // กวาดเฉพาะคนที่เป็น isActive เท่านั้น
    let result = freelancers.filter(f => f.isActive === true);

    // Apply: กรองตามทักษะ (Categories)
    if (selectedCategories.length > 0) {
      result = result.filter((f) => selectedCategories.includes(f.category));
    }

    // Apply: ค้นหาตามคำ (Search)
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase()
      result = result.filter((f) => 
        f.title?.toLowerCase().includes(keyword) || 
        f.category?.toLowerCase().includes(keyword) || 
        f.description?.toLowerCase().includes(keyword)
      )
    }

    // Apply: เรียงลำดับ (Sorting)
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === "rateLow") {
      result.sort((a, b) => a.rate - b.rate)
    } else if (sortBy === "rateHigh") {
      result.sort((a, b) => b.rate - a.rate)
    }

    return result;
  }, [freelancers, selectedCategories, searchTerm, sortBy]); // คำนวณใหม่เมื่อค่าเหล่านี้เปลี่ยนเท่านั้น

  // Handle category checkbox change
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) => (prev.includes(categoryName) ? prev.filter((cat) => cat !== categoryName) : [...prev, categoryName]))
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSearchTerm("")
    // ✅ ไม่ต้องสั่ง setFilteredFreelancers แล้ว เพราะ useMemo จัดการให้
  }

  // Handle apply for Search & Mobile view
  const handleApplyFilters = () => {
    // ✅ ไม่ต้องสั่ง setFilteredFreelancers แล้วuseMemo จัดการให้อัตโนมัติเมื่อsearchTerm หรือ selectedCategories เปลี่ยน
    setIsMobileFilterOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-slate-50 font-['Prompt',sans-serif]">
      {/* Inject Font */}
      <style>
        {`
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');
                body { font-family: 'Prompt', sans-serif; }
                `}
      </style>

      <HeroSection searchTerm={searchTerm} onSearchChange={setSearchTerm} onSearch={handleApplyFilters} />

      <main className="flex flex-1 overflow-hidden max-w-7xl mx-2 sm:mx-20 md:32 lg:mx-32 px-4 sm:px-6 lg:px-4 py-14">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="xl:w-[300px] hidden lg:block shrink-0 lg:pr-4">
            <FilterSection selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange} onClearFilters={handleClearFilters} onApplyFilters={handleApplyFilters} />
          </aside>

          {/* Mobile Filter Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-40 lg:hidden" onClick={() => setIsMobileFilterOpen(false)}>
              <div className="bg-white absolute left-0 top-0 h-full w-3/4 p-6 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">ตัวกรอง</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                    <X size={24} />
                  </button>
                </div>
                <FilterSection selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange} onClearFilters={handleClearFilters} onApplyFilters={handleApplyFilters} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <section className="grow min-h-[600px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <p className="text-slate-800 text-xl mt-1">
                  {/* ✅ ปรับ UI คำนวณจำนวนตาม displayFreelancers */}
                  {(selectedCategories.length > 0 || searchTerm !== "") ? (
                    <>
                      พบ <span className="font-bold text-indigo-600">{displayFreelancers.length}</span> ฟรีแลนซ์ที่ตรงกับตัวกรอง
                    </>
                  ) : (
                    <>
                      พบ <span className="font-bold text-indigo-600">{displayFreelancers.length}</span> ฟรีแลนซ์ที่พร้อมทำงาน
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm">
                  <Filter size={16} className="text-indigo-600" /> ตัวกรอง
                </button>

                <div className="relative group flex-1 sm:flex-none">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-32 md:w-48 flex items-center justify-between bg-white border border-gray-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-slate-700 font-medium transition-colors shadow-sm">
                    <option value="latest">ล่าสุด</option>
                    <option value="rateLow">เรทน้อย → มาก</option>
                    <option value="rateHigh">เรทมาก → น้อย</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ✅ 4. เพิ่ม UI จัดการสถานะ Loading, Error, และ Empty */}
            {isLoading ? (
              // Loading State (อาจจะแทนด้วย Skeleton Card ได้ในอนาคต)
              <div className="text-center py-20 text-slate-600">กำลังโหลดข้อมูลฟรีแลนซ์...</div>
            ) : error ? (
              // Error State
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-3xl p-12 text-center">
                <h3 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h3>
                <p>{error}</p>
              </div>
            ) : displayFreelancers.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <User size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบฟรีแลนซ์ที่ตรงกับตัวกรอง</h3>
                <p className="text-slate-500 mb-6">ลองเปลี่ยนตัวกรองหรือล้างค่าตัวกรองเพื่อดูฟรีแลนซ์ทั้งหมด</p>
                <button onClick={handleClearFilters} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  ล้างค่าตัวกรอง
                </button>
              </div>
            ) : (
              // Freelancer Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* ✅ เปลี่ยนมา Map displayFreelancers แทน */}
                {displayFreelancers.map((freelancer) => (
                  <FreelancerCard key={freelancer._id} freelancer={freelancer} />
                ))}
              </div>
            )}

            {/* Pagination / Load More */}
            {/* <div className="mt-12 text-center">
              <button className="px-10 py-3 bg-white border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:shadow-indigo-300/50 transform hover:scale-[1.01]">โหลดเพิ่มเติม</button>
            </div> */}
          </section>
        </div>
      </main>
    </div>
  )
}

export default Main