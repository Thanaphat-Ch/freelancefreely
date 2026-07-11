const User = require("../models/User")
const cloudinary = require("../config/cloudinary")

// POST /api/users สร้างผู้ใช้ใหม่
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/users ดึงผู้ใช้ทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.status(200).json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}

exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // รับค่า status (true/false) จากหน้าบ้าน (ถ้ามี)

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (typeof status === "boolean") {
      user.isBanned = status
    } else {
      user.isBanned = !user.isBanned
    }

    // Option: ถ้าปลดแบน อาจจะอยาก Reset จำนวนครั้งที่ทำผิดด้วยไหม? (แล้วแต่ Business logic)
    // if (user.isBanned === false) {
    //    user.violationCount = 0;
    // }

    await user.save()

    res.status(200).json({
      message: user.isBanned ? "ระงับการใช้งานเรียบร้อย" : "ปลดระงับการใช้งานเรียบร้อย",
      data: user,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
}

//GET /api/users/me ดึงข้อมูลผู้ใช้ปัจจุบัน
exports.getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json(user)
}
// GET /api/users/:id ดึงผู้ใช้ตาม ID
exports.getUserById = async (req, res) => {
  if (!req.params.id) return res.status(404).json({ message: "IdUser not found" })
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: "User not found" })
  res.json(user)
}

// PUT /api/users อัปเดตข้อมูลตัวเอง
exports.updateUser = async (req, res) => {
  const allowedFields = ["name", "firstName", "lastName", "email", "phone", "bio", "skills", "address"];
  const updates = {}
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = field === "skills" ? JSON.parse(req.body[field]) : req.body[field]
    }
  })
  // avatar
  if (req.files?.profilePicture) {
    const file = req.files.profilePicture[0]
    updates.profilePicture = file.path
  }
  // resume upload
  if (req.files?.resume) {
    const file = req.files.resume[0]
    updates.resume = file.path
  }
  // ❌ ลบ resume
  if (req.body.removeResume === "true") {
    const publicId = `users/${req.user.id}/resume`
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    })
    updates.resume = null
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })
  res.json(user)
}

// GET /api/users/freelancers ดึงรายชื่อฟรีแลนซ์ทั้งหมด
exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: "user" }).select("_id name firstName lastName profilePicture skills address bio created_at")

    res.json(freelancers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/users/change-password เปลี่ยนรหัสผ่าน
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. หา User พร้อมดึง password ออกมา (เพราะใน Model set select: false ไว้)
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. เช็คว่ารหัสเก่าถูกต้องไหม
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    // 3. เปลี่ยนรหัสผ่าน (Pre-save hook ใน Model จะทำการ Hash ให้เองเมื่อมีการแก้ไข password)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/users/delete-account ลบบัญชีตัวเอง
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: ลบไฟล์รูปภาพใน Cloudinary ด้วยถ้ามี
    if (user.profilePicture) {
        // logic ลบรูปใน Cloudinary (ถ้าต้องการ)
    }

    // ลบ User
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "ลบบัญชีเรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};