const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const IMAGE_LIMIT = 5 * 1024 * 1024
const RESUME_LIMIT = 10 * 1024 * 1024
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const fileFilter = (req, file, cb) => {
  switch (file.fieldname) {
    case "profilePicture":
    case "image": // chat
    case "banners":
    case "evidence": // report
      if (!IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new Error("Only JPG, PNG, WEBP allowed"))
      }
      return cb(null, true)

    case "resume":
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Resume must be PDF"))
      }
      return cb(null, true)
    default:
      return cb(new Error("Invalid upload field"))
  }
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const userId = req.user?.id || "guest"
    // 👤 avatar (overwrite)
    if (file.fieldname === "profilePicture") {
      return { folder: "users", public_id: `${userId}/avatar`, resource_type: "image", overwrite: true, }
    }
    // 📄 resume (overwrite)
    if (file.fieldname === "resume") {
      return { folder: "users", public_id: `${userId}/resume`, resource_type: "image", overwrite: true, format: "pdf",  access_mode: "public", }
    }
    // 💬 chat image (single)
    if (file.fieldname === "image") { 
      return { folder: "chat", resource_type: "image",  }
    }
    // 🖼 banner (array)
    if (file.fieldname === "banners") {
      return { folder: "banners", resource_type: "image", }
    }
    // 📝 report evidence images (array)
    if (file.fieldname === "evidence") {
      return {
        folder: "reports",
        public_id: `${userId}/evidence-${Date.now()}`,
        resource_type: "image",
      }
    }
  },
})

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (req, file) =>
      file.fieldname === "resume" ? RESUME_LIMIT : IMAGE_LIMIT,
  },
})


module.exports = upload
