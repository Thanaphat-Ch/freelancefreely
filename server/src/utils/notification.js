// utils/notification.js
const { db } = require("../config/firebaseAdmin");
const admin = require("firebase-admin"); // เพื่อใช้ FieldValue

/**
 * @param {string} toUserId - ID ของ user ที่จะได้รับแจ้งเตือน
 * @param {string} title - หัวข้อ
 * @param {string} message - ข้อความ
 * @param {string} type - job, success, error, info
 * @param {string} link - ลิงก์ที่กดแล้วจะไป (เช่น /job/123)
 */
const sendNotification = async (toUserId, title, message, type = "info", link = "") => {
  try {
    await db.collection("notifications").add({
      toUserId: toUserId,
      title: title,
      message: message,
      type: type,
      link: link,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Notification sent to ${toUserId}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = sendNotification;