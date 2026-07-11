const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post('/verify-identity', controller.verifyIdentity);
router.post('/reset-password-flow', controller.resetPasswordNow);
module.exports = router;