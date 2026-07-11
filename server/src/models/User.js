const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "employer", "admin"], default: "user" },

    profilePicture: { type: String, default: null },
    prefix: { type: String, enum: ["นาย", "นาง", "นางสาว"], required: true },
    name: { type: String, required: false, default: "name" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    idCard: { type: Number, match: /^\d{13}$/, required: true, unique: true },
    phone: { type: Number, match: /^\d{10}$/, required: true, unique: true },
    birthDate: { type: Date, required: true },
    address: { type: String, default: null, required: true },
    bio: String,
    skills: [String],
    website: String, //
    // experience: String,
    resume: { type: String, default: null },
    violationCount: { type: Number, default: 0 }, // นับจำนวนครั้งที่ถูกตัดสินว่าผิดจริง
    isBanned: { type: Boolean, default: false },  // สถานะแบน

    
    // isVerified: { type: Boolean, default: false,},
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: "throw" }
)

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

/**
 * method สำหรับเช็ค password (ใช้ตอน login)
 */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model("User", userSchema)
