const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, }, 
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true,    },
    rating: { type: Number, min: 1, max: 5, required: true },
    // --- เพิ่มคะแนนย่อย 4 ด้าน ---
    ratingSpeed: { type: Number, min: 1, max: 5, required: true },     // ความเร็ว
    ratingService: { type: Number, min: 1, max: 5, required: true },   // บริการ
    ratingExpertise: { type: Number, min: 1, max: 5, required: true }, // ฝีมือ
    ratingValue: { type: Number, min: 1, max: 5, required: true },     // ความคุ้มค่า
    comment: { type: String, trim: true, maxlength: 500,},
  },
  { timestamps: true, strict: "throw" }
)

reviewSchema.index({ reviewer: 1, freelancer: 1, job: 1 }, { unique: true })

module.exports = mongoose.model("Review", reviewSchema)
