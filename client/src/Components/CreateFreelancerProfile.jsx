import { useState } from "react"
import { X, Trash2 } from "lucide-react"
import api from "../api/axios"
import Input from "../Components/Input"
import Swal from "sweetalert2"

// เพิ่ม props: initialData (สำหรับแก้ไข), isEdit (บอกสถานะ)
const FreelancerProfileModal = ({ onClose, onSuccess, initialData = null, isEdit = false }) => {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [rate, setRate] = useState(initialData?.rate || "")

  // แยก state รูปเก่า (URL) กับรูปใหม่ (File)
  const [existingBanners, setExistingBanners] = useState(() => {
    if (isEdit && initialData?.banners) {
      return initialData.banners.map((b) => b.url)
    }
    return []
  })
  const [newBanners, setNewBanners] = useState([]) // URLs for preview
  const [newBannerFiles, setNewBannerFiles] = useState([]) // File Objects

  const handleBannerChange = async (e) => {
    const files = Array.from(e.target.files)
    const totalImages = existingBanners.length + newBannerFiles.length + files.length

    if (totalImages > 5) {
      Swal.fire("เกิดข้อผิดพลาด!", "รวมแล้วอัปโหลดได้สูงสุด 5 รูป", "error")
      return
    }

    // (Code resizeImage ของเดิมใส่ตรงนี้ ...)
    const resizeImage = (file) => Promise.resolve(file) // Mock function for brevity

    const resizedFiles = await Promise.all(files.map((file) => resizeImage(file)))

    setNewBannerFiles((prev) => [...prev, ...resizedFiles])
    const previews = resizedFiles.map((file) => URL.createObjectURL(file))
    setNewBanners((prev) => [...prev, ...previews])
  }

  // ลบรูปใหม่ (ที่เพิ่งเลือก)
  const removeNewBanner = (index) => {
    setNewBanners(newBanners.filter((_, i) => i !== index))
    setNewBannerFiles(newBannerFiles.filter((_, i) => i !== index))
  }

  // ลบรูปเก่า (ที่มีอยู่แล้วใน DB)
  const removeExistingBanner = (index) => {
    setExistingBanners(existingBanners.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (!title || !description || !category || !rate) {
      Swal.fire("เกิดข้อผิดพลาด!", "กรุณากรอกข้อมูลให้ครบ", "error")
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("rate", rate)

      // ส่งรายการรูปเก่าที่ User ยังเก็บไว้ไปให้ Backend
      // Backend จะเช็คว่ารูปไหนหายไปจาก list นี้คือให้ลบทิ้ง
      existingBanners.forEach((url) => formData.append("existingBanners", url))

      // ส่งไฟล์รูปใหม่
      newBannerFiles.forEach((file) => {
        formData.append("banners", file)
      })

      if (isEdit) {
        // UPDATE API
        await api.put(`/freelancers/${initialData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        // CREATE API
        await api.post("/freelancers/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire("เกิดข้อผิดพลาด!", err.response?.data?.message || "ทำรายการไม่สำเร็จ", "error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 h-full flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full h-[85vh] max-w-xl p-6 m-4 relative flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">{isEdit ? "แก้ไขโปรไฟล์งาน" : "สร้างโปรไฟล์ฟรีแลนซ์"}</h2>

        <div className="space-y-4 overflow-y-auto flex-1 pb-2 px-1">
          <Input label="หัวข้อโปรไฟล์" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input as="textarea" label="รายละเอียดงาน" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ... Input Category & Rate เหมือนเดิม ... */}
            <Input
              as="select"
              label="หมวดหมู่งาน"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Full Stack Developer", value: "Full Stack Developer" },
                { label: "Frontend Specialist", value: "Frontend Specialist" },
                { label: "Mobile Developer", value: "Mobile Developer" },
                { label: "DevOps & Cloud", value: "DevOps & Cloud" },
                { label: "UI/UX Designer", value: "UI/UX Designer" },
                { label: "Mobile Application Developer", value: "UI/UX DesignerMobile Application Developer" },
                { label: "Software Developer / Software Engineer", value: "Software Developer / Software Engineer" },
                { label: "Game Developer", value: "Game Developer" },
                { label: "Data Developer / Data Engineer", value: "Data Developer / Data Engineer" },
                { label: "AI / Machine Learning Developer", value: "AI / Machine Learning Developer" },
                { label: "DevOps Engineer", value: "DevOps Engineer" },
                { label: "Cloud Engineer", value: "Cloud Engineer" },
                { label: "Database Developer", value: "Database Developer" },
                { label: "QA / Software Tester", value: "QA / Software Tester" },
                { label: "Embedded Systems Developer", value: "Embedded Systems Developer" },
                { label: "IoT Developer", value: "IoT Developer" },
                { label: "Blockchain Developer", value: "Blockchain Developer" },
                { label: "System Engineer", value: "System Engineer" },
                { label: "Cyber Security Specialist", value: "Cyber Security Specialist" },
                { label: "Penetration Tester (Ethical Hacker)", value: "Penetration Tester (Ethical Hacker)" },
                { label: "System Analyst (SA)", value: "System Analyst (SA)" },
                { label: "Technical Project Manager", value: "Technical Project Manager" },
                { label: "Product Owner (PO)", value: "Product Owner (PO)" },
                { label: "WordPress / CMS Developer", value: "WordPress / CMS Developer" },
                { label: "E-commerce Developer (Shopify/Magento)", value: "E-commerce Developer (Shopify/Magento)" },
                { label: "Site Reliability Engineer (SRE)", value: "Site Reliability Engineer (SRE)" },
                { label: "AR / VR Developer", value: "AR / VR Developer" },
              ]}
            />
            <Input type="number" label="ราคาเริ่มต้น" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>

          <div>
            <p className="font-medium mb-2">แบนเนอร์ (คงเหลือ: {5 - (existingBanners.length + newBannerFiles.length)} รูป)</p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-xl p-6 cursor-pointer hover:bg-indigo-50 transition text-center">
              <p className="text-indigo-600 font-semibold">เพิ่มรูปภาพ</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleBannerChange} />
            </label>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {/* แสดงรูปเก่า */}
              {existingBanners.map((url, i) => (
                <div key={`old-${i}`} className="relative group">
                  <img src={url} className="aspect-video object-cover rounded-lg border" alt="old" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg" />
                  <button onClick={() => removeExistingBanner(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm">
                    <Trash2 size={14} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">เดิม</span>
                </div>
              ))}

              {/* แสดงรูปใหม่ */}
              {newBanners.map((url, i) => (
                <div key={`new-${i}`} className="relative group">
                  <img src={url} className="aspect-video object-cover rounded-lg border" alt="new" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg" />
                  <button onClick={() => removeNewBanner(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm">
                    <Trash2 size={14} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1 rounded">ใหม่</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={submit} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition">
          {isEdit ? "บันทึกการแก้ไข" : "สร้างโปรไฟล์"}
        </button>
      </div>
    </div>
  )
}

export default FreelancerProfileModal
