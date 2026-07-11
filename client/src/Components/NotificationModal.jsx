import { Bell, Clock, X, Info, Briefcase, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, writeBatch, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { formatRelativeTime } from "../utils/Format"; // ตรวจสอบ path ให้ถูกต้อง
import Swal from "sweetalert2";

export default function NotificationModal({ notifications, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatRelativeTime(date);
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle className="text-green-500" size={20} />;
      case "error": return <XCircle className="text-red-500" size={20} />;
      case "job": return <Briefcase className="text-indigo-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      const notiRef = doc(db, "notifications", n.id);
      await updateDoc(notiRef, { isRead: true });
    }
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const q = query(collection(db, "notifications"), where("toUserId", "==", user.id), where("isRead", "==", false));
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  };

  // ฟังก์ชันลบแจ้งเตือน
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // หยุดไม่ให้ event คลิกทะลุไป trigger handleItemClick
    if (!(await Swal.fire({ title:"ยืนยันการลบ?", text: "ต้องการลบแจ้งเตือนนี้ใช่หรือไม่?", icon: "warning", showCancelButton:true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"})).isConfirmed) return
    
    try {
      await deleteDoc(doc(db, "notifications", id))
      Swal.fire("ลบเรียบร้อย", "", "success")
    } catch (error) {
      console.error("Error deleting notification:", error)
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบแจ้งเตือนได้", "error")
    }
  };

  return (
    // ปรับ class ให้ตำแหน่งห้อยลงมาจาก parent (ใน Navbar)
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white shadow-xl rounded-2xl z-50 overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Bell size={16} className="text-indigo-600" />
          การแจ้งเตือน ({notifications.filter(n => !n.isRead).length})
        </h3>
        <div className="flex gap-2">
          {notifications.some(n => !n.isRead) && (
            <button 
                onClick={markAllAsRead}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition"
            >
                อ่านทั้งหมด
            </button>
          )}
          {/* ปุ่มปิด (X) อาจจะไม่จำเป็นมากเพราะคลิกข้างนอกก็ปิดได้ แต่ใส่ไว้ก็ได้ */}
          {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button> */}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              // เพิ่ม group เพื่อใช้ group-hover สำหรับปุ่มลบ
              className={`group p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-3 items-start relative ${
                !n.isRead ? "bg-indigo-50/30" : "bg-white"
              }`}
            >
              {/* Unread Indicator */}
              {!n.isRead && (
                <span className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
              )}

              {/* Icon */}
              <div className="mt-0.5 shrink-0 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                {getIcon(n.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pr-6"> {/* pr-6 เผื่อที่ให้ปุ่มลบ */}
                <div className="flex justify-between items-start">
                    <p className={`text-sm ${!n.isRead ? "font-bold text-slate-800" : "font-medium text-slate-700"}`}>
                    {n.title}
                    </p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                  <Clock size={10} />
                  {getTimeAgo(n.createdAt)}
                </div>
              </div>

              {/* Delete Button (Show on Hover) */}
              <button 
                onClick={(e) => handleDelete(e, n.id)}
                className="absolute right-2 bottom-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="ลบแจ้งเตือน"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
                <Bell size={24} className="opacity-20" />
            </div>
            <p className="text-xs">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        )}
      </div>
      
      {/* Footer (Optional) */}
      {/* {notifications.length > 0 && (
          <div className="bg-gray-50 p-1.5 text-center border-t border-gray-100 text-[10px] text-gray-400">
             แสดง 20 รายการล่าสุด
          </div>
      )} */}
    </div>
  );
}