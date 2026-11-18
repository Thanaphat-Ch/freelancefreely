const jwt = require("jsonwebtoken")
const User = require("../models/User")

module.exports = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ message: "No token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("+isBanned")
    if (!user) return res.status(401).json({ message: "User not found" })  
    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned",
        code: "ACCOUNT_BANNED",
      })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
