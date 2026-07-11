const sendNotification = require("../utils/notification")
const Report = require("../models/Report");
const User = require("../models/User");

exports.createReport = async (req, res) => {
  try {
    const { targetUserId, reason, description } = req.body;
    const reporterId = req.user.id; // สมมติว่าดึง ID จาก Middleware verifyToken

    let evidenceImages = [];
    if (req.files && req.files.length > 0) {
      evidenceImages = req.files.map(file => file.path);
    }
    if (reporterId === targetUserId) return res.status(400).json({ message: "ไม่สามารถรายงานตัวเองได้" });
    const targetExists = await User.findById(targetUserId);
    if (!targetExists) return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการรายงาน" });


    const newReport = new Report({
      reporter: reporterId,
      targetUser: targetUserId,
      reason,
      description,
      evidenceImages

    });
    await newReport.save();

    res.status(201).json({ 
      message: "ส่งรายงานเรียบร้อยแล้ว", 
      data: newReport 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const expiredReports = await Report.find({
      status: 'investigating',
      investigationStartedAt: { $lte: fourteenDaysAgo }
    });
    if (expiredReports.length > 0) {   
      await Promise.all(expiredReports.map(async (report) => {
         // A. เปลี่ยนสถานะ
         report.status = 'resolved';
         report.adminNote = (report.adminNote || '') + '\n[System]: ครบกำหนด 14 วัน (อนุมัติอัตโนมัติ)';
         await report.save();

         // B. ลงโทษ User (Copy Logic เดิมมา)
         const targetUser = await User.findById(report.targetUser);
         if (targetUser) {
            targetUser.violationCount = (targetUser.violationCount || 0) + 1;
            if (targetUser.violationCount >= 4) {
               targetUser.isBanned = true;
            }
            await targetUser.save();
            
            await sendNotification(
              report.targetUser.toString(),
              "ผลการตรวจสอบ: คุณถูกตัดคะแนน",
              "รายงานของคุณครบกำหนด 14 วันแล้ว",
              "system_success",
            );
         }
      }));
    }

    const reports = await Report.find()
      .populate("reporter", "name email profilePicture")
      .populate("targetUser", "name email profilePicture violationCount isBanned") // ดึงข้อมูลการแบนมาดูด้วย
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. อัปเดตสถานะรายงาน (Admin Only)
// exports.updateReportStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, adminNote, chatRoomId } = req.body;

//     const report = await Report.findById(id);
//     if (!report) return res.status(404).json({ message: "ไม่พบรายงาน" });

//     // เก็บสถานะเดิมเพื่อเช็คว่าเปลี่ยนเป็น resolved หรือไม่
//     const oldStatus = report.status;
//     report.status = status;
//     if (adminNote) report.adminNote = adminNote;
//     await report.save();

//     if (status === "resolved" && report.status !== "resolved") {
//          const targetUser = await User.findById(report.targetUser);
//          if (targetUser) {
//              targetUser.violationCount = (targetUser.violationCount || 0) + 1;
//              if (targetUser.violationCount >= 4) targetUser.isBanned = true;
//              await targetUser.save();
//          }
//     }

//     // --- Logic การแบน ---
//     // ถ้าเปลี่ยนสถานะเป็น "resolved" (ตัดสินว่าผิดจริง) และสถานะเดิมไม่ใช่ resolved
//     if (status === "resolved" && oldStatus !== "resolved") {
//       const targetUser = await User.findById(report.targetUser);
//       if (targetUser) {
//         // เพิ่มจำนวนครั้งที่ทำผิด
//         targetUser.violationCount = (targetUser.violationCount || 0) + 1;
//         if (targetUser.violationCount >= 4) { targetUser.isBanned = true; }
//         await targetUser.save();
//       }
//     }

//     res.status(200).json({ message: "อัปเดตสถานะเรียบร้อย", data: report });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, chatRoomId } = req.body; 

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "ไม่พบรายงาน" });

    const oldStatus = report.status;

    // ======================================================
    // CASE 1: รับเรื่องตรวจสอบ (Pending -> Investigating)
    // ======================================================
    if (status === 'investigating' && oldStatus === 'pending') {
        const now = new Date();

        report.investigationStartedAt = now;
        if (chatRoomId) { report.chatRoomId = chatRoomId }

        const chatLink = chatRoomId ? `/chat?id=${chatRoomId}` : `/chat`;
        await sendNotification(
            report.targetUser.toString(),
            "⚠️ รายงานเข้าสู่กระบวนการตรวจสอบ",
            "คุณถูกรายงาน กรุณาชี้แจงข้อเท็จจริงผ่านแชทกับadminภายใน 14 วัน",
            "report_warning",
            chatLink 
        );
    }

    // ======================================================
    // CASE 2: ตัดสินว่าผิดจริง (Resolved)
    // ======================================================
    // ทำงานเมื่อสถานะใหม่คือ "resolved" และของเดิมต้อง "ไม่ใช่ resolved"
    if (status === "resolved" && oldStatus !== "resolved") {
      const targetUser = await User.findById(report.targetUser);
      
      if (targetUser) {
        // 1. เพิ่มแต้มความผิด
        targetUser.violationCount = (targetUser.violationCount || 0) + 1;
        
        // 2. เช็คเงื่อนไขการแบน (ครบ 4 ครั้ง = แบน)
        if (targetUser.violationCount >= 4) {
          targetUser.isBanned = true;
        }
        
        await targetUser.save();

        // 3. แจ้งเตือนผลการตัดสิน
        await sendNotification(
           report.targetUser.toString(),
           "ผลการตรวจสอบ: คุณทำผิดกฎชุมชน",
           `มีการยืนยันความผิด (ครั้งที่ ${targetUser.violationCount}) หากครบ 4 ครั้งบัญชีจะถูกระงับ`,
           "system_alert",
        );
      }
    }


    if (status === "dismissed" && oldStatus !== "dismissed") {
        // แจ้งเตือนว่ารอดตัวแล้ว
        await sendNotification(
           report.targetUser.toString(),
           "ผลการตรวจสอบ: ยกคำร้อง",
           "รายงานของคุณถูกตรวจสอบแล้ว ไม่พบการกระทำผิด",
           "system_success",
           "/notifications"
        );
    }

    report.status = status; 
    
    if (adminNote) report.adminNote = adminNote;
    
    await report.save();

    res.status(200).json({ message: "อัปเดตสถานะเรียบร้อย", data: report });

  } catch (err) {
    console.error("Update Report Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};