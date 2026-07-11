const router = require("express").Router()
const controller = require("../controllers/freelancer.controller")
const auth = require("../middlewares/auth")
const upload = require("../middlewares/upload")

router.get("/", controller.getAllProfiles)
router.get("/me", auth, controller.getMyProfile)
router.get("/:id", controller.getProfile)
router.get("/detail/:id", controller.getFreelancerDetail)
router.post("/profile", auth, upload.array("banners", 5),controller.createProfile)

router.put("/:id", auth, upload.array("banners", 5), controller.updateProfile) // แก้ไข
router.delete("/:id", auth, controller.deleteProfile) // ลบ
router.patch("/:id/status", auth, controller.toggleStatus) // เปิด/ปิดงาน

module.exports = router
