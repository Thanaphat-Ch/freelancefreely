const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth")
const controller = require("../controllers/review.controller")

router.get("/me", auth, controller.getMyReviews)
router.get("/me/rating", auth, controller.getFreelancerRating)
router.get("/:id/rating", controller.getFreelancerRatingById)
router.get("/:id", controller.getMyReviewsById)

module.exports = router