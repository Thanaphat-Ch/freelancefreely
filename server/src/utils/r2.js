const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const path = require("path")
const r2 = require("../config/r2")

const uploadToR2 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })
  await r2.send(command)
  return key
}

const deleteFromR2 = async (keyOrUrl) => {
  if (!keyOrUrl) return
  try {
    // สกัดเอาเฉพาะ Key หากค่าที่ส่งมาเป็น Full URL
    const key = keyOrUrl.replace(/^https?:\/\/[^/]+\//, "")
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
    await r2.send(command)
  } catch (err) {
    console.error("R2 Delete Error:", err)
  }
}

// ต่อ Prefix สำหรับส่งกลับไปให้หน้าบ้านแสดงผล
const attachCdnUrl = (key) => {
  if (!key) return null
  if (key.startsWith("http")) return key
  return `${process.env.CDN_BASE_URL}/${key}`
}

const formatProfileUrls = (profile) => {
  const obj = profile.toObject ? profile.toObject() : { ...profile }
  if (obj.banners) {
    obj.banners = obj.banners.map((b) => ({
      ...b,
      url: attachCdnUrl(b.key || b.url),
    }))
  }
  return obj
}

module.exports = {
  uploadToR2,
  deleteFromR2,
  attachCdnUrl,
  formatProfileUrls,
}