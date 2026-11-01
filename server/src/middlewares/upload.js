const multer = require("multer")
const path = require("path")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const r2 = require("../config/r2")

const IMAGE_LIMIT = 5 * 1024 * 1024
const RESUME_LIMIT = 10 * 1024 * 1024
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const fileFilter = (req, file, cb) => {
  switch (file.fieldname) {
    case "profilePicture":
    case "image":
    case "banners":
    case "evidence":
      if (!IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new Error("Only JPG, PNG, WEBP allowed"), false)
      }
      return cb(null, true)

    case "file":
    case "resume":
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Resume must be PDF"), false)
      }
      return cb(null, true)

    default:
      return cb(new Error("Invalid upload field"), false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: RESUME_LIMIT,
  },
})

// Helper สำหรับ Upload Buffer ขึ้น R2
const uploadToR2 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })

  await r2.send(command)
  return key
}

// ฟังก์ชันสร้าง Key/Path ตามโครงสร้างโฟลเดอร์ที่เราออกแบบไว้
const generateR2Key = (userId, fieldname, originalname = "", extraId = "") => {
  const ext = path.extname(originalname).toLowerCase() || ".jpg"
  const timestamp = Date.now()

  switch (fieldname) {
    case "profilePicture":
      return `users/${userId}/avatar${ext}`
    case "resume":
    case "file":
      return `users/${userId}/resume.pdf`
    case "banners":
      return `users/${userId}/jobs/${extraId || "temp"}/banners/${timestamp}${ext}`
    case "image":
      return `chat/${userId}/${timestamp}${ext}`
    case "evidence":
      return `reports/${userId}/${timestamp}${ext}`
    default:
      return `misc/${userId}/${timestamp}${ext}`
  }
}

module.exports = {
  upload,
  uploadToR2,
  generateR2Key,
}