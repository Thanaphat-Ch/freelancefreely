const mongoose = require("mongoose")

const ReportSchema = new mongoose.Schema(
  {
    // ผู้ส่งรายงาน (ดึงจาก Token ของคนที่ Login)
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // ผู้ที่ถูกรายงาน (Target)
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // หัวข้อการรายงาน (ตรงกับ Value ใน Dropdown หน้าบ้าน)
    reason: { type: String, enum: ["spam", "fake_profile", "harassment", "fraud", "inappropriate_content", "other"], required: true },
    // รายละเอียดเพิ่มเติม
    description: { type: String, maxLength: 1000 },
    evidenceImages: [{ type: String }], //// เก็บ URL รูปภาพหลักฐาน
    // สถานะของรายงาน (เพื่อให้ Admin มากดเปลี่ยนสถานะ)
    status: { type: String, enum: ["pending", "investigating", "resolved", "dismissed"], default: "pending" },
    // บันทึกสิ่งที่ Admin จัดการ (Optional)
    adminNote: { type: String },

    investigationStartedAt: { type: Date }, // วันที่ admin กดรับเรื่อง
  },
  { timestamps: true },
)

module.exports = mongoose.model("Report", ReportSchema)
