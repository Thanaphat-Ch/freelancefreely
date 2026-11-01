const router = require("express").Router()
const { upload, uploadToR2, generateR2Key } = require("../middleware/upload")
const auth = require("../middleware/auth")

router.post("/resume", auth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })

    const userId = req.user?.id || "guest"
    const key = generateR2Key(userId, "resume", req.file.originalname)

    await uploadToR2(req.file, key)

    res.json({
      key,
      url: `${process.env.CDN_BASE_URL}/${key}`,
    })
  } catch (err) {
    next(err)
  }
})
