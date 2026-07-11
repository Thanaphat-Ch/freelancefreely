const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const auth = require("../middlewares/auth");
const allowRoles = require("../middlewares/allowRoles");
const upload = require("../middlewares/upload");

router.post("/", auth, upload.array("evidence", 5), reportController.createReport);


router.get("/", auth, allowRoles("admin"), reportController.getAllReports);
router.patch('/:id', auth, allowRoles("admin"), reportController.updateReportStatus);

module.exports = router;