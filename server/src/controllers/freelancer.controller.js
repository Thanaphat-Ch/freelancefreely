const FreelancerProfile = require("../models/FreelancerProfile")
const path = require("path")
const { uploadToR2, deleteFromR2, formatProfileUrls } = require("../utils/r2")

// GET /api/freelancers/detail/:id ดึงโปรไฟล์ฟรีแลนซ์ตาม ID
exports.getFreelancerDetail = async (req, res) => {
  try {
    const freelancer = await FreelancerProfile.findOne({ _id: req.params.id }).populate("user", "name profilePicture created_at")

    if (!freelancer) return res.status(404).json({ message: "ไม่พบ freelancer" })
    res.json(formatProfileUrls(freelancer))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/freelancers/me ดึงโปรไฟล์ตัวเอง
exports.getMyProfile = async (req, res) => {
  try {
    const profiles = await FreelancerProfile.find({ user: req.user.id })
    res.json(profiles.map(formatProfileUrls))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
exports.getProfile = async (req, res) => {
  try {
    const profiles = await FreelancerProfile.find({ user: req.params.id })
    res.json(profiles.map(formatProfileUrls))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
// GET /api/freelancers
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await FreelancerProfile.find({ isActive: true }).sort({ createdAt: -1 })
    res.json(profiles.map(formatProfileUrls))
  } catch (err) {
    res.status(500).json({ message: "ดึงโปรไฟล์ฟรีแลนซ์ไม่สำเร็จ" })
  }
}

// POST /api/freelancers สร้างโปรไฟล์ฟรีแลนซ์
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const banners = []

    if (req.files && req.files.length > 0) {
      for (const [index, file] of req.files.entries()) {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg"
        const key = `users/${userId}/jobs/temp/banners/${Date.now()}_${index}${ext}`
        await uploadToR2(file, key)
        banners.push({ key, order: index + 1 })
      }
    }

    const profile = await FreelancerProfile.create({
      user: userId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      rate: req.body.rate,
      banners,
    })

    res.status(201).json(formatProfileUrls(profile))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/freelancers/:id แก้ไขโปรไฟล์
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, rate, existingBanners } = req.body

    const profile = await FreelancerProfile.findOne({ _id: id, user: req.user.id })
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์หรือคุณไม่มีสิทธิ์แก้ไข" })

    // Normalize input เป็น Array
    const keepList = existingBanners ? (Array.isArray(existingBanners) ? existingBanners : [existingBanners]) : []

    // 1. ลบรูปที่ผู้ใช้คัดออก (เทียบจาก key หรือ url)
    const bannersToDelete = profile.banners.filter((b) => {
      const currentIdentifier = b.key || b.url
      return !keepList.includes(currentIdentifier)
    })

    for (const b of bannersToDelete) {
      await deleteFromR2(b.key || b.url)
    }

    // เก็บเฉพาะรูปที่ยังใช้อยู่
    let updatedBanners = profile.banners.filter((b) => {
      const currentIdentifier = b.key || b.url
      return keepList.includes(currentIdentifier)
    })

    // 2. อัปโหลดรูปใหม่เข้า R2
    if (req.files && req.files.length > 0) {
      for (const [index, file] of req.files.entries()) {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg"
        const key = `users/${req.user.id}/jobs/${id}/banners/${Date.now()}_${index}${ext}`
        await uploadToR2(file, key)
        updatedBanners.push({ key, order: updatedBanners.length + 1 })
      }
    }

    profile.title = title
    profile.description = description
    profile.category = category
    profile.rate = rate
    profile.banners = updatedBanners

    await profile.save()
    res.json(formatProfileUrls(profile))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/freelancers/:id ลบโปรไฟล์
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์" })

    if (profile.banners && profile.banners.length > 0) {
      for (const b of profile.banners) {
        await deleteFromR2(b.key || b.url)
      }
    }

    res.json({ message: "ลบโปรไฟล์สำเร็จ" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PATCH /api/freelancers/:id/status เปลี่ยนสถานะ เปิด/ปิด
exports.toggleStatus = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ _id: req.params.id, user: req.user.id })
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์" })

    profile.isActive = !profile.isActive
    await profile.save()

    res.json({ isActive: profile.isActive, message: profile.isActive ? "เปิดรับงานแล้ว" : "ปิดรับงานชั่วคราว" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
