const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_ADMIN_CONFIG) {
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