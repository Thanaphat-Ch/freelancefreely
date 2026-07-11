const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["chat", "job", "system"], required: true },
    title: String,
    message: String,
    data: {
      conversationId: mongoose.Schema.Types.ObjectId,
      jobId: mongoose.Schema.Types.ObjectId,
      senderId: mongoose.Schema.Types.ObjectId,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, strict: "throw" }
)

notificationSchema.index({ userId: 1, isRead: 1 })

module.exports = mongoose.model("Notification", notificationSchema)

// _id
// userId
// type
// title
// message
// data
// isRead
