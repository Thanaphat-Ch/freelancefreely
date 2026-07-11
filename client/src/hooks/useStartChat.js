// hooks/useStartChat.js (หรือไฟล์ที่คุณเก็บ Hook นี้ไว้)
import { db } from "../firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

export const useStartChat = () => {
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user"))
  const currentProfile = JSON.parse(localStorage.getItem("profilePic"))

  // 1. ฟังก์ชันใหม่: ทำหน้าที่แค่หา หรือ สร้างห้อง แล้วคืนค่า ID (ไม่ย้ายหน้า)
  const getOrCreateChatId = async (targetUserId, targetUserName, targetUserPic) => {
    const currentUserId = currentUser?.id || currentUser?._id
    if (!currentUser || !currentUserId) return null;

    try {
      const chatsRef = collection(db, "chats")
      const q = query(chatsRef, where("participants", "array-contains", currentUserId))
      const querySnapshot = await getDocs(q)
      let existingChatId = null

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.participants.includes(targetUserId)) {
          existingChatId = doc.id
        }
      })

      const safeCurrentName = currentUser.name || "Admin"
      const safeCurrentPic = currentProfile || ""
      const safeTargetName = targetUserName || "ไม่ระบุชื่อ"
      const safeTargetPic = targetUserPic || ""
      
      const participantDetails = {
        [currentUserId]: { name: safeCurrentName, pic: safeCurrentPic },
        [targetUserId]: { name: safeTargetName, pic: safeTargetPic },
      }

      if (existingChatId) {
        const chatDocRef = doc(db, "chats", existingChatId)
        await updateDoc(chatDocRef, {
          participantDetails: participantDetails,
          updatedAt: serverTimestamp()
        })
        return existingChatId; // <--- Return ID กลับไป
      } else {
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [currentUserId, targetUserId],
          participantDetails: participantDetails,
          lastMessage: "Admin เริ่มการสอบสวนรายงาน", 
          updatedAt: serverTimestamp(),
        })
        return newChatRef.id; // <--- Return ID ใหม่กลับไป
      }
    } catch (error) {
      console.error("Error creating chat:", error)
      return null;
    }
  }

  // 2. ฟังก์ชันเดิม: ใช้สำหรับปุ่มกดเพื่อไปหน้าแชท (เรียกใช้ฟังก์ชันข้างบน)
  const startChat = async (targetUserId, targetUserName, targetUserPic) => {
     if (currentUser?.id === targetUserId) {
        return Swal.fire("Error", "ไม่สามารถแชทกับตัวเองได้", "error")
     }
     const chatId = await getOrCreateChatId(targetUserId, targetUserName, targetUserPic);
     const chatBasePath = currentUser.role === "admin" ? "/admin/chat" : "/chat"
     
     if(chatId) navigate(`${chatBasePath}?id=${chatId}`)
  }

  // ส่งออกทั้ง 2 ฟังก์ชัน
  return { startChat, getOrCreateChatId }
}