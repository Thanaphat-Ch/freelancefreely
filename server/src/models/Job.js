const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // skills: [String], //
    category: {type: String},
    type: { type: String, enum: ["full-time", "part-time", "contract", "freelance"], default: "freelance" },
    businessType: String,
    // tags: [String], 
    rate: { type: String, required: true },
    deadline: Date,
    endPost: { type: Date, required: true },

    status: { type: String, enum: ["offer", "rejected", "open", "in_progress", "completed"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,  },
    // acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", },

    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
        message: String,
        // price: Number, //
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, strict: "throw" }
)

module.exports = mongoose.model("Job", jobSchema)
