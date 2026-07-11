const FreelancerProfile = require("../models/FreelancerProfile")

// GET /api/freelancers/detail/:id ดึงโปรไฟล์ฟรีแลนซ์ตาม ID
exports.getFreelancerDetail = async (req, res) => {
  try {
    const freelancer = await FreelancerProfile.findOne({
      _id: req.params.id, }).populate("user", "name profilePicture created_at")

    if (!freelancer) return res.status(404).json({ message: "ไม่พบ freelancer" })
    res.json(freelancer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/freelancers/me ดึงโปรไฟล์ตัวเอง
exports.getMyProfile = async (req, res) => {
  const profile = await FreelancerProfile.find({ user: req.user.id })
  res.json(profile)
}
exports.getProfile = async (req, res) => {
  const profile = await FreelancerProfile.find({ user: req.params.id })
  res.json(profile)
}
// GET /api/freelancers
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await FreelancerProfile.find({ isActive: true })
      .sort({ createdAt: -1 })
    res.json(profiles)
  } catch (err) {
    res.status(500).json({ message: "ดึงโปรไฟล์ฟรีแลนซ์ไม่สำเร็จ" })
  }
}

// POST /api/freelancers สร้างโปรไฟล์ฟรีแลนซ์
exports.createProfile = async (req, res) => {
  const banners = req.files?.map(file => ({
    url: file.path,
    public_id: file.filename,
  })) || []

  const profile = await FreelancerProfile.create({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    rate: req.body.rate,
    banners,
  })

  res.status(201).json(profile)
}

// Helper สำหรับลบไฟล์จริง (ถ้าเก็บในเครื่อง)
const deleteFile = (filePath) => {
  // logic การลบไฟล์ขึ้นอยู่กับว่าคุณเก็บไฟล์ที่ไหน (Local หรือ Cloudinary/S3)
  // ตัวอย่างสำหรับ Local:
  try {
     // fs.unlinkSync(filePath); 
     console.log("Delete file:", filePath) 
  } catch (err) { console.error(err) }
}

// PUT /api/freelancers/:id แก้ไขโปรไฟล์
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, rate, existingBanners } = req.body;

    // หาโปรไฟล์เดิมเพื่อเช็คสิทธิ์และเอารูปเก่ามาจัดการ
    const profile = await FreelancerProfile.findOne({ _id: id, user: req.user.id });
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์หรือคุณไม่มีสิทธิ์แก้ไข" });

    // 1. จัดการรูปภาพ
    // existingBanners ส่งมาจากหน้าบ้านเป็น Array ของ URL ที่ user *ยังเก็บไว้*
    // รูปไหนใน DB ไม่อยู่ใน existingBanners ให้ลบทิ้ง
    const keepBanners = existingBanners ? (Array.isArray(existingBanners) ? existingBanners : [existingBanners]) : [];
    
    // หาความต่าง: รูปที่มีใน DB แต่ไม่มีใน keepBanners คือรูปที่ต้องลบ
    const bannersToDelete = profile.banners.filter(b => !keepBanners.includes(b.url));
    bannersToDelete.forEach(b => {
        // *** ใส่ Logic ลบไฟล์ออกจาก Server/Cloud ที่นี่ ***
        deleteFile(b.url); // หรือ b.public_id ถ้าใช้ Cloudinary
    });

    // กรองเอาเฉพาะ Object รูปเดิมที่ User เลือกเก็บไว้
    let updatedBanners = profile.banners.filter(b => keepBanners.includes(b.url));

    // เพิ่มรูปใหม่ที่อัปโหลดเข้ามา
    if (req.files && req.files.length > 0) {
      const newBanners = req.files.map(file => ({
        url: file.path, // หรือ URL จาก Cloud
        public_id: file.filename
      }));
      updatedBanners = [...updatedBanners, ...newBanners];
    }

    // 2. อัปเดตข้อมูล
    profile.title = title;
    profile.description = description;
    profile.category = category;
    profile.rate = rate;
    profile.banners = updatedBanners;

    await profile.save();
    res.json(profile);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/freelancers/:id ลบโปรไฟล์
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์" });

    // ลบรูปทั้งหมดของงานนี้
    if (profile.banners && profile.banners.length > 0) {
      profile.banners.forEach(b => {
         // *** ใส่ Logic ลบไฟล์ออกจาก Server/Cloud ที่นี่ ***
         deleteFile(b.url);
      });
    }

    res.json({ message: "ลบโปรไฟล์สำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/freelancers/:id/status เปลี่ยนสถานะ เปิด/ปิด
exports.toggleStatus = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ _id: req.params.id, user: req.user.id });
    if (!profile) return res.status(404).json({ message: "ไม่พบโปรไฟล์" });

    profile.isActive = !profile.isActive; // สลับค่า True/False
    await profile.save();

    res.json({ isActive: profile.isActive, message: profile.isActive ? "เปิดรับงานแล้ว" : "ปิดรับงานชั่วคราว" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



