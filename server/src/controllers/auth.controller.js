const User = require("../models/User")
const jwt = require("jsonwebtoken")
const passport = require("passport")

const bcrypt = require("bcryptjs")

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, idCard, password, birthDate } = req.body
    if (!isAge18Plus(birthDate)) {
      return res.status(400).json({ message: "ต้องมีอายุอย่างน้อย 18 ปี" })
    }
    if (!isValidThaiID(idCard)) {
      return res.status(400).json({ message: "เลขบัตรประชาชนไม่ถูกต้อง" })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" })
    }
    const normalizeEmail = email.toLowerCase().trim()
    const exists = await User.findOne({ $or: [{ email: normalizeEmail }, { idCard }] })
    if (exists) return res.status(400).json({ message: "ข้อมูลนี้ถูกใช้แล้ว" })
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "รหัสผ่านไม่ปลอดภัย" })
    }

    const user = await User.create({
      ...req.body,
      email: normalizeEmail,
    })

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมลของคุณ",
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
function isValidThaiID(id) {
  if (!/^\d{13}$/.test(id)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i)
  }
  const check = (11 - (sum % 11)) % 10
  return check === parseInt(id[12])
}
function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)
}
function isAge18Plus(birthDate) {
    if (!birthDate) return false
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 18
  }

// POST /api/auth/login
exports.login = async (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim()
  }
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (!user) return res.status(401).json({ code: "INVALID_CREDENTIALS", message: info?.message || "Login failed" })
    if (user.isBanned) {
      return res.status(403).json({
        code: "ACCOUNT_BANNED",
        message: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      profilePic: user.profilePicture,
    })
  })(req, res, next)
}


exports.verifyIdentity = async (req, res) => {
  try {
    const { email, idCard, phone, birthDate } = req.body;
    const normalizeEmail = email ? email.toLowerCase().trim() : "";
    // 1. หา User จาก Email
    const user = await User.findOne({ normalizeEmail });
    if (!user) {
      // เพื่อความปลอดภัย อาจจะตอบ Error กลางๆ แต่ถ้าระบบภายใน บอกตรงๆ ได้เลย
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // 2. แปลงวันที่ให้เป็น Format YYYY-MM-DD เพื่อเทียบกัน (ตัดเรื่องเวลาออก)
    // หมายเหตุ: ต้องมั่นใจว่า Database เก็บ Date ถูกต้อง
    const dbBirthDate = new Date(user.birthDate).toISOString().split('T')[0];
    const inputBirthDate = new Date(birthDate).toISOString().split('T')[0];

    // 3. เทียบข้อมูล (ต้องตรงทุกตัว)
    const isMatch = 
      user.idCard === idCard && 
      user.phone === phone && 
      dbBirthDate === inputBirthDate;

    if (!isMatch) {
      return res.status(400).json({ message: "ข้อมูลยืนยันตัวตนไม่ถูกต้อง" });
    }

    // 4. ถ้าถูก สร้าง Token พิเศษ (อายุสั้นๆ เช่น 10 นาที) ส่งกลับไปให้หน้าเว็บ
    const resetToken = jwt.sign(
      { id: user._id, role: user.role, type: "RESET_FLOW" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "10m" }
    );

    res.json({ 
      message: "ยืนยันตัวตนสำเร็จ", 
      resetToken // ส่งกุญแจนี้ไปให้ Frontend เก็บไว้
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};
// 2. เปลี่ยนรหัสผ่าน (Reset Password Now)
exports.resetPasswordNow = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ตรวจสอบว่าเป็น Token สำหรับเปลี่ยนรหัสจริงหรือไม่
    if (decoded.type !== "RESET_FLOW") {
      return res.status(400).json({ message: "Token ไม่ถูกต้อง" });
    }

    // Hash รหัสผ่านใหม่ (ตอนนี้ใช้ได้แล้วเพราะ import bcrypt มาแล้ว)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // อัปเดตลงฐานข้อมูล
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(400).json({ message: "หมดเวลาดำเนินการ หรือข้อมูลผิดพลาด กรุณาเริ่มใหม่" });
  }
};