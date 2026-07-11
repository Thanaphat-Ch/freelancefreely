const Job = require("../models/Job")
const Review = require("../models/Review")
const User = require("../models/User")
const sendNotification = require("../utils/notification")

// GET /api/jobs?status=<status> ดึงงานทั้งหมด
exports.getJobs = async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  const jobs = await Job.find(filter).populate("createdBy", "name email")
  // const jobs = await Job.find(filter)
  res.json(jobs)
}

// GET /api/jobs/detail/:id ดึงงานตาม ID
exports.getJobdetail = async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("createdBy", "name profilePicture")
    .populate("applicants.user", "name profilePicture role")
  if (!job) return res.status(404).json({ message: "Job not found" })
  const userId = req.user?.id

  res.json({
    ...job.toObject(),

    isOwner: userId && job.createdBy._id.toString() === userId,
    isFreelancer: userId && job.freelancer && job.freelancer._id.toString() === userId,
    hasApplied: userId ? job.applicants.some((a) => a.user._id.toString() === userId) : false,
    canApply: userId && job.status === "open",
    canAccept: userId && job.status === "open" && job.createdBy._id.toString() === userId,
    completed: userId && job.status === "completed",
  })
}
// GET /api/jobs/me ดึงงานตัวเอง
exports.getJobMe = async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    const baseFilter = status ? { status } : {}

    const [hiredJobs, workingJobs] = await Promise.all([
      // งานที่ฉันเป็นคนจ้าง
      Job.find({ ...baseFilter, createdBy: userId })
        .populate("createdBy", "name email profilePicture")
        .populate("freelancer", "name profilePicture")
        .sort({ createdAt: -1 }),

      // งานที่ฉันถูกจ้าง
      Job.find({ ...baseFilter, freelancer: userId })
        .populate("createdBy", "name email profilePicture")
        .populate("freelancer", "name profilePicture")
        .sort({ createdAt: -1 }),
    ])

    res.json({
      hiredJobs,
      workingJobs,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "ดึงงานของฉันไม่สำเร็จ" })
  }
}
exports.getJobById = async (req, res) => {
  try {
    const userId = req.params.id
    const filter = { $or: [{ createdBy: userId }, { freelancer: userId }] }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const jobs = await Job.find(filter).populate("createdBy", "name email profilePicture").sort({ createdAt: -1 })
    res.json(jobs)
  } catch (err) {
    res.status(500).json({ message: "ดึงงานของฉันไม่สำเร็จ" })
  }
}

// POST /api/jobs เพิ่มงานใหม่
exports.createJob = async (req, res) => {
  const job = await Job.create({
    ...req.body,
    createdBy: req.user.id,
  })
  res.status(201).json(job)
}

// POST /api/jobs/:id/apply สมัครงาน
exports.applyJob = async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) return res.status(404).json({ message: "Job not found" })
  if (job.status !== "open") return res.status(400).json({ message: "งานนี้ปิดรับแล้ว" })

  const alreadyApplied = job.applicants.some((a) => a.user.toString() === req.user.id)
  if (alreadyApplied) return res.status(400).json({ message: "คุณสมัครงานนี้ไปแล้ว" })

  job.applicants.push({
    user: req.user.id,
    message: req.body.message,
  })

  await job.save()
  await sendNotification(
    job.createdBy.toString(), // ส่งหาเจ้าของงาน
    "มีผู้สมัครงานใหม่ 📝",
    `คุณ ${req.user.name} ได้สมัครงาน "${job.title}"`,
    "job",
    `/job/${job._id}`, // ลิงก์ไปหน้างาน
  )

  res.json(job)
}

exports.acceptFreelancer = async (req, res) => {
  const job = await Job.findById(req.params.jobId)
  if (job.createdBy.toString() !== req.user.id) return res.status(403).json({ message: "Not owner" })
  if (job.status !== "open") return res.status(400).json({ message: "Job already in progress" })

  job.status = "in_progress"
  job.freelancer = req.params.userId
  job.applicants.forEach((a) => {
    a.status = a.user.toString() === req.params.userId ? "accepted" : "rejected"
  })
  await job.save()
  await sendNotification(
    req.params.userId, // ส่งหาฟรีแลนซ์
    "คุณได้รับการจ้างงาน 🎉",
    `เจ้าของงานเลือกคุณสำหรับงาน "${job.title}" เริ่มงานได้เลย!`,
    "success",
    `/job/${job._id}`,
  )
  res.json(job)
}

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id)
  if (!job) return res.status(404).json({ message: "ไม่พบงาน" })
  if (job.createdBy.toString() !== req.user.id) return res.status(403).json({ message: "ไม่มีสิทธิ์" })
  if (job.status === "in_progress") return res.status(400).json({ message: "ไม่สามารถลบงานที่มีการจ้างแล้วได้" })
  await job.deleteOne()
  res.json({ message: "ลบประกาศเรียบร้อย" })
}

// POST /api/jobs/:id/finish จบงานพร้อมรีวิว
exports.finishWithReview = async (req, res) => {
  const { rating, comment, freelancerId, ratingSpeed, ratingService, ratingExpertise, ratingValue } = req.body
  const job = await Job.findById(req.params.id)
  if (!job) return res.status(404).json({ message: "ไม่พบงาน" })
  if (job.createdBy.toString() !== req.user.id) return res.status(403).json({ message: "ไม่มีสิทธิ์" })
  if (job.status !== "in_progress") return res.status(400).json({ message: "ยังไม่มีการจ้างงาน" })
  const freelancer = await User.findById(freelancerId)
  if (!freelancer) return res.status(400).json({ message: "ไม่พบฟรีแลนซ์" })

  try {
    await Review.create({
      reviewer: req.user.id,
      freelancer: freelancerId,
      job: job._id,
      rating, // คะแนนเฉลี่ย
      ratingSpeed, // คะแนนความเร็ว
      ratingService, // คะแนนบริการ
      ratingExpertise, // คะแนนฝีมือ
      ratingValue, // คะแนนความคุ้มค่า
      comment,
    })
  } catch (err) {
    console.error("REVIEW CREATE ERROR:", err)
    if (err.code === 11000) return res.status(400).json({ message: "คุณได้รีวิวงานนี้ไปแล้ว" })
    if (err.name === "StrictModeError") {
      return res.status(400).json({ message: "ข้อมูลที่ส่งมาไม่ถูกต้อง (Field เกิน)", details: err.message })
    }
    return res.status(500).json({
      message: "ไม่สามารถโพสรีวิวได้",
      error: err.message,
    })
  }

  job.status = "completed"
  await job.save()
  await sendNotification(
    freelancerId, // ส่งหาฟรีแลนซ์
    "งานเสร็จสมบูรณ์ ✅",
    `ลูกค้าได้อนุมัติจบงาน "${job.title}" และให้รีวิวคุณแล้ว`,
    "success",
    `/job/${job._id}`,
  )

  res.json({ message: "จบงานเรียบร้อย" })
}

// POST /api/jobs/offer ส่งข้อเสนอให้ฟรีแลนซ์
exports.createOffer = async (req, res) => {
  try {
    const { freelancerId, title, description, rate, deadline } = req.body
    if (!freelancerId || !title || !rate) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบ" })
    }

    const offer = await Job.create({
      createdBy: req.user.id,
      freelancer: freelancerId,
      title,
      description,
      rate,
      deadline,
      status: "offer",
      endPost: deadline,
    })

    await sendNotification(
      freelancerId, // ส่งหาฟรีแลนซ์
      "ได้รับข้อเสนอจ้างงาน 📩",
      `คุณได้รับข้อเสนอจ้างงานใหม่: "${title}" กดเพื่อดูรายละเอียด`,
      "job",
      `/job/${offer._id}`,
    )

    res.status(201).json({
      message: "ส่งข้อเสนอเรียบร้อย",
      offer,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/jobs/:id/respond-offer ตอบรับหรือปฏิเสธ offer
exports.respondOffer = async (req, res) => {
  try {
    const { action } = req.body
    const job = await Job.findById(req.params.id)

    if (!job) return res.status(404).json({ message: "ไม่พบ offer" })
    if (job.freelancer.toString() !== req.user.id) return res.status(403).json({ message: "ไม่มีสิทธิ์" })
    if (job.status !== "offer") return res.status(400).json({ message: "offer นี้ถูกตอบไปแล้ว" })
    if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "action ไม่ถูกต้อง" })
    if (action === "accept") {
      job.status = "in_progress"
    }
    if (action === "reject") {
      job.status = "rejected"
    }
    await job.save()

    const notiTitle = action === "accept" ? "ข้อเสนอได้รับการตอบรับ ✅" : "ข้อเสนอถูกปฏิเสธ ❌"
    const notiMsg = action === "accept" ? `คุณ ${req.user.name} ตกลงรับงาน "${job.title}" แล้ว` : `คุณ ${req.user.name} ปฏิเสธงาน "${job.title}"`
    const notiType = action === "accept" ? "success" : "error"

    await sendNotification(
      job.createdBy.toString(), // ส่งหาเจ้าของงาน
      notiTitle,
      notiMsg,
      notiType,
      `/job/${job._id}`,
    )

    res.json({
      message: action === "accept" ? "รับงานเรียบร้อย" : "ปฏิเสธ offer แล้ว",
      job,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
