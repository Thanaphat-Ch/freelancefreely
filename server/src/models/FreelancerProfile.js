const mongoose = require("mongoose")

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    title: String,
    banners: [
      {
        url: String,
        public_id: String, 
      }
    ],
    description: String,
    category: {type: String},
    type: Number,
    rate: Number,
    isActive: {type: Boolean, default: true, }, 
  },
  { timestamps: true, strict: "throw" }
)

module.exports = mongoose.model("Freelanceprofile", freelancerProfileSchema)