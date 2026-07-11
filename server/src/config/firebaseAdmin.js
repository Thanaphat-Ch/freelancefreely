const admin = require("firebase-admin");

// เช็คว่ามีตัวแปร Environment ไหม (บน Vercel จะมี, แต่ Local อาจจะไม่มี)
let serviceAccount;

if (process.env.FIREBASE_ADMIN_CONFIG) {
  // กรณีอยู่บน Vercel: แปลง String กลับเป็น Object
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
} else {
  try {
    serviceAccount = require("../../serviceAccountKey.json");
  } catch (e) {
    console.error("ไม่พบไฟล์ serviceAccountKey.json และไม่มี Environment Variable");
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
module.exports = { admin, db };