import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { db } from "../firebase"
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore"
import { ArrowLeft, Send, Search, Image as ImageIcon, Smile, X, CheckCheck } from "lucide-react" // เพิ่ม CheckCheck
import imageCompression from "browser-image-compression"
import axios from "axios"
import Swal from "sweetalert2"

const formatTime = (timestamp) => {
  if (!timestamp) return ""
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentChatId = searchParams.get("id")
  const user = JSON.parse(localStorage.getItem("user"))
  const scrollRef = useRef()
  const fileInputRef = useRef(null)

  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [enlargedImage, setEnlargedImage] = useState(null)

  const CLOUD_NAME = "dxum5yvdm"
  const UPLOAD_PRESET = "chat_upload"

  // 1. ดึงรายการห้องแชท
  useEffect(() => {
    if (!user?.id) return
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.id), orderBy("updatedAt", "desc"))
    return onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
  }, [user?.id])

  // 2. ดึงข้อความ & เคลียร์ Unread ของเรา
  useEffect(() => {
    if (!currentChatId || !user) return

    const chatRef = doc(db, "chats", currentChatId)
    updateDoc(chatRef, { [`unreadCounts.${user.id}`]: 0 }).catch((err) => console.error(err))

    const q = query(collection(db, "chats", currentChatId, "messages"), orderBy("createdAt", "asc"))
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
  }, [currentChatId, user?.id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, previewUrl])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) return Swal.fire("เกิดข้อผิดพลาด!", "ไฟล์มีขนาดใหญ่เกิน 3MB", "error")
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
    e.target.value = null
  }

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !currentChatId) return

    try {
      setIsUploading(true)
      const currentChatData = chats.find((c) => c.id === currentChatId)
      const partnerId = currentChatData?.participants.find((id) => id !== user.id)

      if (selectedFile) {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true }
        const compressedFile = await imageCompression(selectedFile, options)
        const formData = new FormData()
        formData.append("file", compressedFile)
        formData.append("upload_preset", UPLOAD_PRESET)

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData)
        await addDoc(collection(db, "chats", currentChatId, "messages"), {
          image: res.data.secure_url,
          type: "image",
          senderId: user.id,
          createdAt: serverTimestamp(),
        })
      }

      if (newMessage.trim()) {
        await addDoc(collection(db, "chats", currentChatId, "messages"), {
          text: newMessage,
          senderId: user.id,
          createdAt: serverTimestamp(),
        })
      }

      const lastMsgText = selectedFile ? "ส่งรูปภาพ" : newMessage
      await updateDoc(doc(db, "chats", currentChatId), {
        lastMessage: lastMsgText,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${partnerId}`]: increment(1),
      })

      setNewMessage("")
      clearPreview()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const currentChatData = chats.find((c) => c.id === currentChatId)
  const currentPartnerId = currentChatData?.participants.find((id) => id !== user.id)
  const currentPartner = currentChatData?.participantDetails?.[currentPartnerId]

  // เช็คว่าฝั่งตรงข้ามอ่านหรือยัง (ถ้า unread ของเขาเป็น 0 แปลว่าเขาอ่านแล้ว)
  const isPartnerRead = currentChatData?.unreadCounts?.[currentPartnerId] === 0

  return (
    // ปรับ h-screen และ overflow-hidden เพื่อไม่ให้ scroll ทั้งหน้าจอ
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50 font-['Prompt'] overflow-hidden">
      {/* --- Sidebar (Scroll แยก) --- */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${currentChatId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 mb-4">ข้อความ</h1>
          <div className="relative">
            <input type="text" placeholder="ค้นหาแชท..." className="w-full bg-slate-100 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const otherId = chat.participants.find((id) => id !== user.id)
            const otherUser = chat.participantDetails[otherId]
            const isActive = currentChatId === chat.id
            const unreadCount = chat.unreadCounts?.[user.id] || 0
            const isUnread = unreadCount > 0

            return (
              <div key={chat.id} onClick={() => setSearchParams({ id: chat.id })} className={`p-4 cursor-pointer transition-all flex gap-3 hover:bg-slate-50 ${isActive ? "bg-indigo-50/60 border-r-4 border-indigo-500" : "border-r-4 border-transparent"}`}>
                <div className="relative shrink-0">
                  <img src={otherUser?.pic || "https://ui-avatars.com/api/?name=" + otherUser?.name} className="w-12 h-12 rounded-full object-cover shadow-sm" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`truncate text-sm md:text-base ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{otherUser?.name}</h3>
                    <span className={`text-[10px] shrink-0 ${isUnread ? "text-indigo-600 font-bold" : "text-gray-400"}`}>{formatTime(chat.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${isUnread ? "text-slate-900 font-bold" : "text-gray-500"}`}>{chat.lastMessage || "ส่งรูปภาพ"}</p>
                    {isUnread && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full min-w-5 text-center font-bold"> {unreadCount} </span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* --- Chat Area --- */}
      <div className={`flex-1 flex flex-col bg-[#F8FAFC] relative ${!currentChatId ? "hidden md:flex" : "flex"}`}>
        {currentChatId ? (
          <>
            {/* Chat Header (Fixed at top) */}
            <div className="h-16 px-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center gap-3 shrink-0 z-20">
              <button onClick={() => setSearchParams({})} className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-slate-600">
                <ArrowLeft size={20} />
              </button>
              <img src={currentPartner?.pic || "https://ui-avatars.com/api/?name=" + currentPartner?.name} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                <h2 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{currentPartner?.name}</h2>
                <span className="text-[10px] md:text-xs text-green-500 font-medium">ออนไลน์</span>
              </div>
            </div>

            {/* Messages Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user.id
                const isLastMessage = index === messages.length - 1
                return (
                  <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                      {msg.type === "image" ? (
                        <img src={msg.image} alt="sent" className="rounded-xl border border-gray-200 max-h-60 w-auto object-cover cursor-pointer mb-1" onClick={() => setEnlargedImage(msg.image)} />
                      ) : (
                        <div className={`px-4 py-2 shadow-sm wrap-break-word ${isMe ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" : "bg-white text-slate-700 border border-gray-100 rounded-2xl rounded-tl-sm"}`}>
                          <span className="text-sm md:text-[15px]">{msg.text}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                        {/* แสดง "อ่านแล้ว" เฉพาะข้อความสุดท้ายที่เราเป็นคนส่ง */}
                        {isMe && isLastMessage && isPartnerRead && (
                          <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-0.5">
                            <CheckCheck size={12} /> อ่านแล้ว
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area (Fixed at bottom) */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 z-20">
              {previewUrl && (
                <div className="absolute bottom-full left-0 w-full bg-white/95 p-3 flex items-center gap-3 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-lg shadow-md object-cover" />
                    <button onClick={clearPreview} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-end gap-2 max-w-5xl mx-auto">
                <button type="button" onClick={() => fileInputRef.current.click()} className={`p-2.5 mb-0.5 hover:bg-slate-100 rounded-full text-slate-400 ${selectedFile ? "text-indigo-500" : ""}`}>
                  <ImageIcon size={22} />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 border border-transparent focus-within:border-indigo-200 transition-all">
                  <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-slate-700 py-1" placeholder={selectedFile ? "เพิ่มข้อความหรือกดส่ง..." : "พิมพ์ข้อความ..."} />
                  <Smile size={20} className="text-slate-400 cursor-pointer" />
                </div>

                <button type="submit" disabled={isUploading || (!newMessage.trim() && !selectedFile)} className={`p-3 rounded-full shadow-md transition-all mb-0.5 ${!newMessage.trim() && !selectedFile ? "bg-gray-100 text-gray-400" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">

            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <Send size={32} className="text-indigo-300 ml-1" />
            </div>
            <p className="text-slate-500 font-medium">เลือกแชทเพื่อเริ่มคุย</p>
          </div>
        )}
      </div>

      {/* --- Lightbox --- */}
      {enlargedImage && (
        <div className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4" onClick={() => setEnlargedImage(null)}>
          <img src={enlargedImage} className="max-w-full max-h-full object-contain" alt="" />
        </div>
      )}
    </div>
  )
}

export default Chat
