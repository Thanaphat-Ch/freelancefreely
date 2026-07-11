const connectDB = require("../config/db")


async function dbMiddleware(req, res, next) {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Database connection failed" })
  }
}

module.exports = dbMiddleware
