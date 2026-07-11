require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbMiddleware = require("./middlewares/dbMiddleware");
const passport = require("./config/passport");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(dbMiddleware)
app.use(passport.initialize())


// routes
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/freelancers", require("./routes/freelancer.routes"))
app.use("/api/reviews", require("./routes/review.routes"))
app.use("/api/reports", require("./routes/report.routes"))

app.use("/uploads", express.static("uploads"))

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err)
  console.error("🔥 MESSAGE:", err.message)
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message })
  }
  res.status(500).json({
    message: err.message || "Internal Server Error",
  })
})

module.exports = app;
