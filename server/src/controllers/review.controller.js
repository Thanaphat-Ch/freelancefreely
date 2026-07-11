const Review = require("../models/Review")
const mongoose = require("mongoose")

// GET /api/reviews/me/rating ดึงคะแนนรีวิวเฉลี่ยของฟรีแลนซ์ตัวเอง
exports.getFreelancerRating = async (req, res) => {
  try {

    const objectId = new mongoose.Types.ObjectId(req.user.id)
    const stats = await Review.aggregate([
      { $match: { freelancer: objectId } },
      {
        $group: {
          _id: "$freelancer",
          totalReviews: { $sum: 1 },
          // หาค่าเฉลี่ยทั้ง 5 ด้าน
          avgRating: { $avg: "$rating" },          // เฉลี่ยรวม
          avgSpeed: { $avg: "$ratingSpeed" },      // เฉลี่ยความเร็ว
          avgService: { $avg: "$ratingService" },  // เฉลี่ยบริการ
          avgExpertise: { $avg: "$ratingExpertise" }, // เฉลี่ยฝีมือ
          avgValue: { $avg: "$ratingValue" }       // เฉลี่ยความคุ้มค่า
        },
      },
      // (Optional) จัดรูปแบบทศนิยมให้สวยงาม (1 ตำแหน่ง)
      {
        $project: {
          totalReviews: 1,
          avgRating: { $round: ["$avgRating", 1] },
          avgSpeed: { $round: ["$avgSpeed", 1] },
          avgService: { $round: ["$avgService", 1] },
          avgExpertise: { $round: ["$avgExpertise", 1] },
          avgValue: { $round: ["$avgValue", 1] },
        }
      }
    ])
    // ถ้ายังไม่มีรีวิว ให้ return ค่า 0 ทั้งหมด
    const result = stats[0] || {
      totalReviews: 0,
      avgRating: 0,
      avgSpeed: 0,
      avgService: 0,
      avgExpertise: 0,
      avgValue: 0,
    }

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "คำนวณคะแนนไม่สำเร็จ" })
  }
}
// GET /api/reviews/:id/rating ดึงคะแนนรีวิวเฉลี่ยของฟรีแลนซ์ตาม ID
exports.getFreelancerRatingById = async (req, res) => {
 try {
    const objectId = new mongoose.Types.ObjectId(req.params.id)

    const stats = await Review.aggregate([
      { $match: { freelancer: objectId } },
      {
        $group: {
          _id: "$freelancer",
          totalReviews: { $sum: 1 },
          // หาค่าเฉลี่ยทั้ง 5 ด้าน
          avgRating: { $avg: "$rating" },          // เฉลี่ยรวม
          avgSpeed: { $avg: "$ratingSpeed" },      // เฉลี่ยความเร็ว
          avgService: { $avg: "$ratingService" },  // เฉลี่ยบริการ
          avgExpertise: { $avg: "$ratingExpertise" }, // เฉลี่ยฝีมือ
          avgValue: { $avg: "$ratingValue" }       // เฉลี่ยความคุ้มค่า
        },
      },
      // (Optional) จัดรูปแบบทศนิยมให้สวยงาม (1 ตำแหน่ง)
      {
        $project: {
          totalReviews: 1,
          avgRating: { $round: ["$avgRating", 1] },
          avgSpeed: { $round: ["$avgSpeed", 1] },
          avgService: { $round: ["$avgService", 1] },
          avgExpertise: { $round: ["$avgExpertise", 1] },
          avgValue: { $round: ["$avgValue", 1] },
        }
      }
    ])

    // ถ้ายังไม่มีรีวิว ให้ return ค่า 0 ทั้งหมด
    const result = stats[0] || {
      totalReviews: 0,
      avgRating: 0,
      avgSpeed: 0,
      avgService: 0,
      avgExpertise: 0,
      avgValue: 0,
    }

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "คำนวณคะแนนไม่สำเร็จ" })
  }
}

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancer: req.user.id })
      .select("reviewer rating comment createdAt") // เลือกเฉพาะ: คนรีวิว, คะแนนรวม, คอมเมนต์, วันที่
      .populate("reviewer", "name profileImage") // (แนะนำ) ดึงชื่อและรูปคนรีวิวมาด้วย เพื่อไปแสดงผลหน้าเว็บ
      .sort({ createdAt: -1 }) // เรียงจากใหม่สุดไปเก่าสุด

    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "ดึงข้อมูลรีวิวไม่สำเร็จ" })
  }
}
exports.getMyReviewsById = async (req, res) => {
   try {
    const reviews = await Review.find({ freelancer: req.params.id })
      .select("reviewer rating comment createdAt") // เลือกเฉพาะ: คนรีวิว, คะแนนรวม, คอมเมนต์, วันที่
      .populate("reviewer", "name profileImage") //ดึงชื่อและรูปคนรีวิวมาด้วย เพื่อไปแสดงผลหน้าเว็บ
      .sort({ createdAt: -1 }) // เรียงจากใหม่สุดไปเก่าสุด
    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "ดึงข้อมูลรีวิวไม่สำเร็จ" })
  }
}
