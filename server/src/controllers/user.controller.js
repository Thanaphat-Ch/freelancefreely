const User = require("../models/User")
const path = require("path")
const { uploadToR2, deleteFromR2, attachCdnUrl } = require("../utils/r2")

const formatUserUrls = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user }
  if (obj.profilePicture) obj.profilePicture = attachCdnUrl(obj.profilePicture)
  if (obj.resume) obj.resume = attachCdnUrl(obj.resume)
  return obj
}

// POST /api/users สร้างผู้ใช้ใหม่
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(formatUserUrls(user))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/users ดึงผู้ใช้ทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.status(200).json(users.map(formatUserUrls))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}

// PATCH /api/users/:id/ban
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.isBanned = typeof status === "boolean" ? status : !user.isBanned
    await user.save()

    res.status(200).json({
      message: user.isBanned ? "ระงับการใช้งานเรียบร้อย" : "ปลดระงับการใช้งานเรียบร้อย",
      data: formatUserUrls(user),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}

//GET /api/users/me ดึงข้อมูลผู้ใช้ปัจจุบัน
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(formatUserUrls(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
// GET /api/users/:id ดึงผู้ใช้ตาม ID
exports.getUserById = async (req, res) => {
  try {
    if (!req.params.id) return res.status(404).json({ message: "IdUser not found" })
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(formatUserUrls(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/users อัปเดตข้อมูลตัวเอง
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    const allowedFields = ["name", "firstName", "lastName", "email", "phone", "bio", "skills", "address"]
    const updates = {}

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === "skills" ? JSON.parse(req.body[field]) : req.body[field]
      }
    })

    // อัปโหลด Avatar ใหม่ลง R2 (และลบรูปเดิมถ้ามี)
    if (req.files?.profilePicture) {
      const file = req.files.profilePicture[0]
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg"
      const key = `users/${userId}/avatar_${Date.now()}${ext}`

      await uploadToR2(file, key)
      if (user.profilePicture) await deleteFromR2(user.profilePicture)
      updates.profilePicture = key
    }

    // อัปโหลด Resume ลง R2
    if (req.files?.resume) {
      const file = req.files.resume[0]
      const key = `users/${userId}/resume.pdf`

      await uploadToR2(file, key)
      updates.resume = key
      updates.resumeName = file.originalname
    }

    // ลบ Resume ออกจาก R2
    if (req.body.removeResume === "true") {
      if (user.resume) await deleteFromR2(user.resume)
      updates.resume = null
      updates.resumeName = null
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true })
    res.json(formatUserUrls(updatedUser))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/freelancers ดึงรายชื่อฟรีแลนซ์ทั้งหมด
exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: "user" }).select("_id name firstName lastName profilePicture skills address bio created_at")
    res.json(freelancers.map(formatUserUrls))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/users/change-password เปลี่ยนรหัสผ่าน
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select("+password")
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" })

    user.password = newPassword
    await user.save()
    res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}

// DELETE /api/users/delete-account ลบบัญชีตัวเอง
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    // ลบไฟล์ส่วนตัวทั้งหมดออกจาก R2 ก่อนลบข้อมูล User
    if (user.profilePicture) await deleteFromR2(user.profilePicture)
    if (user.resume) await deleteFromR2(user.resume)

    await User.findByIdAndDelete(req.user.id)
    res.status(200).json({ message: "ลบบัญชีเรียบร้อยแล้ว" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}