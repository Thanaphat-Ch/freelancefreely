const express = require("express");
const router = express.Router();
const controller = require("../controllers/job.controller");
const auth = require("../middlewares/auth");

router.get("/", controller.getJobs);
router.get("/me", auth, controller.getJobMe);
router.get("/detail/:id", auth, controller.getJobdetail);
router.get("/:id", controller.getJobById);

router.post("/", auth, controller.createJob);
router.post("/:id/apply", auth, controller.applyJob);
router.post("/:id/finish-with-review", auth, controller.finishWithReview );
router.post("/:jobId/accept/:userId", auth, controller.acceptFreelancer);
router.post("/offer", auth, controller.createOffer);
router.patch("/offer/:id/respond", auth, controller.respondOffer);
router.delete("/:id", auth, controller.deleteJob);

module.exports = router;
