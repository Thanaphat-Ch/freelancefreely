const express = require("express")
const router = express.Router()
const controller = require("../controllers/user.controller")
const auth = require("../middlewares/auth")
const allowRoles = require("../middlewares/allowRoles")
const upload = require("../middlewares/upload")

router.post("/", auth, allowRoles("admin"), controller.createUser)

router.put("/", auth,
  (req, res, next) => {
    req.uploadType = "user"
    next()
  },
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  controller.updateUser,
)

router.get("/", auth, allowRoles("admin"), controller.getAllUsers);
router.patch("/:id/ban", auth, allowRoles("admin"), controller.toggleUserBan);

router.get("/me", auth, controller.getCurrentUser)
router.get("/favorite", auth, controller.getCurrentUser)
router.get("/freelancers", controller.getFreelancers)
router.get("/:id", controller.getUserById)
router.put("/change-password", auth, controller.changePassword);
router.delete("/", auth, controller.deleteAccount);

module.exports = router
