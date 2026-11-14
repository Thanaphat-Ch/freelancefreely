import { useState } from "react"
import { X, Trash2 } from "lucide-react"
import api from "../api/axios"
import Input from "../Components/Input"
import Swal from "sweetalert2"
import { resizeImage } from "../utils/imageResizer"

const FreelancerProfileModal = ({ onClose, onSuccess, initialData = null, isEdit = false }) => {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [rate, setRate] = useState(initialData?.rate || "")

  const [existingBanners, setExistingBanners] = useState(() => {
    if (isEdit && initialData?.banners) {
      return initialData.banners.map((b) => (typeof b === "string" ? b : b.url))
    }
    return []
  })

  const [newBannerPreviews, setNewBannerPreviews] = useState([])
  const [newBannerFiles, setNewBannerFiles] = useState([])

  const handleBannerChange = async (e) => {
    const rawFiles = Array.from(e.target.files)
    if (!rawFiles.length) return

    const totalImages = existingBanners.length + newBannerFiles.length + rawFiles.length
    if (totalImages > 5) return Swal.fire("เกิดข้อผิดพลาด!", "รวมแล้วอัปโหลดได้สูงสุด 5 รูป", "error")

    const resizedFiles = await Promise.all(rawFiles.map((file) => resizeImage(file, 1280, 720, 0.8)))
    const previewUrls = resizedFiles.map((file) => URL.createObjectURL(file))

    setNewBannerFiles((prev) => [...prev, ...resizedFiles])
    setNewBannerPreviews((prev) => [...prev, ...previewUrls])
    e.target.value = ""
  }

  const removeNewBanner = (index) => {
    URL.revokeObjectURL(newBannerPreviews[index])
    setNewBannerPreviews((prev) => prev.filter((_, i) => i !== index))
    setNewBannerFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingBanner = (index) => {
    setExistingBanners((prev) => prev.filter((_, i) => i !== index))
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

      existingBanners.forEach((bannerUrl) => {
        formData.append("existingBanners", bannerUrl)
      })

      newBannerFiles.forEach((file) => {
        formData.append("banners", file)
      })

      if (isEdit) {
        await api.put(`/freelancers/${initialData._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
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

  const remainingSlots = 5 - (existingBanners.length + newBannerFiles.length)

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
                { label: "Mobile Application Developer", value: "Mobile Application Developer" },
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
            <p className="font-medium mb-2">แบนเนอร์ (คงเหลือ: {remainingSlots} รูป)</p>

            {remainingSlots > 0 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-xl p-6 cursor-pointer hover:bg-indigo-50 transition text-center">
                <p className="text-indigo-600 font-semibold">เพิ่มรูปภาพ</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleBannerChange} />
              </label>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4">
              {existingBanners.map((url, i) => (
                <div key={`old-${i}`} className="relative group">
                  <img src={url} className="aspect-video object-cover rounded-lg border w-full h-full" alt="existing-banner" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg" />
                  <button type="button" onClick={() => removeExistingBanner(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm">
                    <Trash2 size={14} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">เดิม</span>
                </div>
              ))}

              {newBannerPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative group">
                  <img src={url} className="aspect-video object-cover rounded-lg border w-full h-full" alt="new-banner" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg" />
                  <button type="button" onClick={() => removeNewBanner(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm">
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
