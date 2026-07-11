import { useState, useEffect } from "react"
import { AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Image as ImageIcon, MessageCircle } from "lucide-react"
import api from "../../api/axios"
import Swal from "sweetalert2";
// อย่าลืม Import Hook ที่คุณสร้างไว้
import { useStartChat } from "../../hooks/useStartChat"; 
import { FormatDate, formatRelativeTime } from "../../utils/Format";

// =======================
// Helper: คำนวณเวลาถอยหลัง
// =======================
const calculateTimeLeft = (report) => {
  // 1. ยังไม่รับเรื่อง
  if (report.status === 'pending') {
      return <span className="text-slate-500 font-medium text-xs">รอ Admin รับเรื่อง (เวลายังไม่เดิน)</span>;
  }

  // 2. จบเคสแล้ว
  if (['resolved', 'dismissed'].includes(report.status)) {
      return <span className="text-slate-400 text-xs">ปิดเคสแล้ว</span>;
  }

  // 3. สถานะ investigating -> คำนวณเวลา
  if (!report.autoResolveDate) return null;
  
  const deadline = new Date(report.autoResolveDate);
  const now = new Date();
  const diff = deadline - now;
  
  if (diff <= 0) return <span className="text-red-600 font-bold text-xs">หมดเวลา (รอระบบประมวลผล)</span>;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return <span className="text-orange-600 font-bold text-xs">เหลือเวลา {days} วัน {hours} ชม.</span>;
};

// =======================
// Component: Modal รายละเอียด
// =======================
const ReportDetailModal = ({ report, onClose }) => {
  const { startChat } = useStartChat(); // เรียกใช้ Hook

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-lg">รายละเอียดรายงาน</h3>
           <div className="flex items-center gap-3">
               {/* Countdown Display */}
               <div className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-2">
                  <Clock size={14} className="text-slate-400"/>
                  {calculateTimeLeft(report)}
               </div>
               <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><XCircle size={24} className="text-slate-500"/></button>
           </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
             {/* ผู้แจ้ง (Reporter) */}
             <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">ผู้แจ้ง (Reporter)</p>
                <div 
                  className="font-semibold text-indigo-700 cursor-pointer hover:underline"
                  onClick={() => startChat(report.reporter?._id, report.reporter?.name, report.reporter?.profilePicture)}
                >
                    {report.reporter?.name}
                </div>
                <p className="text-xs text-slate-400">{report.reporter?.email}</p>
             </div>

             {/* ผู้ถูกรายงาน (Accused) */}
             <div className="p-3 bg-red-50 rounded-lg relative group">
                <p className="text-xs text-slate-500 mb-1">ผู้ถูกรายงาน (Accused)</p>
                <div className="flex justify-between items-start">
                   <div>
                      <div 
                        className="font-semibold text-red-700 cursor-pointer hover:underline"
                        onClick={() => startChat(report.targetUser?._id, report.targetUser?.name, report.targetUser?.profilePicture)}
                      >
                         {report.targetUser?.name}
                      </div>
                      <p className="text-xs text-slate-400">ผิดแล้ว: {report.targetUser?.violationCount || 0} ครั้ง</p>
                      {report.targetUser?.isBanned && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">BANNED</span>}
                   </div>
                   {/* ปุ่มแชทใน Modal */}
                   <button 
                      onClick={() => startChat(report.targetUser?._id, report.targetUser?.name, report.targetUser?.profilePicture)}
                      className="p-2 bg-white text-indigo-600 rounded-full shadow-sm hover:bg-indigo-50 border border-indigo-100 transition-all"
                      title="แชทเพื่อสอบสวน"
                   >
                      <MessageCircle size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* รายละเอียด */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
               <AlertTriangle size={18} className="text-orange-500"/> หัวข้อ: {report.reason}
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed">
               {report.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </div>
          </div>

          {/* รูปหลักฐาน */}
          {report.evidenceImages?.length > 0 && (
            <div>
               <h4 className="font-semibold mb-3 flex items-center gap-2"><ImageIcon size={18}/> หลักฐานรูปภาพ</h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {report.evidenceImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border hover:opacity-90">
                       <img src={img} alt="evidence" className="w-full h-full object-cover" />
                    </a>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =======================
// Main Component: หน้า Admin Report
// =======================
const AdminReportPage = ({ isHistory }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  
  // เรียกใช้ Hook เพื่อจัดการเรื่องแชท
  const { getOrCreateChatId, startChat } = useStartChat();

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await api.get("/reports") 
      setReports(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // ฟังก์ชันอัปเดตสถานะ (Update Status)
  const handleUpdateStatus = async (id, newStatus) => {
    const targetReport = reports.find(r => r._id === id); // หาข้อมูล report นั้นๆ ก่อน
    
    const confirmMsg = newStatus === 'resolved' ? "ยืนยันว่าผู้ใช้มีความผิดจริง?" : `หลังรับเรื่องแล้วจะต้องตรวจสอบ ภายใน 14 วัน`;

    if (!(await Swal.fire({ title:"ยืนยันรับเรื่องตรวจสอบ?", text: confirmMsg, icon: "warning", showCancelButton:true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก"})).isConfirmed) return

    try {
        let chatRoomId = null;

        // --- เพิ่ม Logic ตรงนี้ ---
        // ถ้าสถานะเป็น "กำลังตรวจสอบ" (Investigating) ให้สร้างห้องแชทเงียบๆ ทันที
        if (newStatus === 'investigating' && targetReport) {
            chatRoomId = await getOrCreateChatId(
                targetReport.targetUser._id,
                targetReport.targetUser.name,
                targetReport.targetUser.profilePicture
            );
        }
        // -----------------------

        // ส่ง request ไป Backend พร้อม chatRoomId (ถ้ามี)
        await api.patch(`/reports/${id}`, { 
            status: newStatus,
            chatRoomId: chatRoomId 
        })

        // Update UI
        setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r))
        
        if(newStatus === 'resolved') fetchReports();
        
        Swal.fire("Success", "อัปเดตสถานะเรียบร้อย", "success");

    } catch (err) {
      console.error(err)
      Swal.fire("Update failed!", "เกิดข้อผิดพลาดไม่สามารถอัพเดตได้", "error")
    }
  }

  // Filter Data
  const filteredReports = reports.filter(r => 
    isHistory 
      ? ["resolved", "dismissed"].includes(r.status) 
      : ["pending", "investigating"].includes(r.status)
  )

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600"/></div>

  // ------------------------------------------------
  // VIEW 1: INCOMING REPORTS (Grid 2 Columns)
  // ------------------------------------------------
  if (!isHistory) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
           <AlertTriangle className="text-orange-500"/> เรื่องร้องเรียนใหม่ ({filteredReports.length})
        </h2>
        
        {filteredReports.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">ไม่มีเรื่องร้องเรียนใหม่</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {filteredReports.map(report => (
               <div key={report._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col">
                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-4">
                      <div>
                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${report.status === 'investigating' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {report.status === 'investigating' ? 'กำลังตรวจสอบ' : 'รอตรวจสอบ'}
                         </span>
                         <div className="text-xs text-slate-400 mt-1 gap-1">
                            {new Date(report.createdAt).toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit'})}
                            <span className="ml-1">{formatRelativeTime( report.investigationStartedAt || report?.createdAt)}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {calculateTimeLeft(report)}
                        {report.evidenceImages?.length > 0 && (
                            <span className="text-xs flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                <ImageIcon size={12}/> มีรูป
                            </span>
                        )}
                      </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg mb-2 text-slate-800">{report.reason}</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mb-4 line-clamp-3">
                     "{report.description}"
                  </p>
                  
                  {/* User Info & Chat Link */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                          ถูกรายงาน: 
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                startChat(report.targetUser?._id, report.targetUser?.name, report.targetUser?.profilePicture);
                            }}
                            className="font-semibold text-red-600 hover:underline flex items-center gap-1"
                          >
                             {report.targetUser?.name} <MessageCircle size={10}/>
                          </button>
                      </div>
                      <button onClick={() => setSelectedReport(report)} className="text-indigo-600 hover:underline">ดูรายละเอียด</button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                      {report.status === 'pending' ? (
                         <button onClick={() => handleUpdateStatus(report._id, 'investigating')} className="col-span-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
                            รับเรื่อง (ตรวจสอบ)
                         </button>
                      ) : (
                         <>
                            <button onClick={() => handleUpdateStatus(report._id, 'dismissed')} className="py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm">
                               ยกคำร้อง
                            </button>
                            <button onClick={() => handleUpdateStatus(report._id, 'resolved')} className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                               อนุมัติ (รายงาน)
                            </button>
                         </>
                      )}
                  </div>
               </div>
             ))}
           </div>
        )}
        {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      </div>
    )
  }

  // ------------------------------------------------
  // VIEW 2: HISTORY REPORTS (Table)
  // ------------------------------------------------
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
         <Clock className="text-slate-500"/> ประวัติการรายงาน
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                    <th className="p-4 font-semibold text-slate-600">วันที่</th>
                    <th className="p-4 font-semibold text-slate-600">หัวข้อ</th>
                    <th className="p-4 font-semibold text-slate-600">ผู้ถูกรายงาน</th>
                    <th className="p-4 font-semibold text-slate-600">สถานะ</th>
                    <th className="p-4 font-semibold text-slate-600 text-right">จัดการ</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredReports.map(report => (
                    <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 text-slate-500 whitespace-nowrap">
                          {new Date(report.createdAt).toLocaleDateString('th-TH')}
                       </td>
                       <td className="p-4 font-medium text-slate-800">
                          {report.reason}
                          {report.evidenceImages?.length > 0 && <ImageIcon size={14} className="inline ml-2 text-slate-400"/>}
                       </td>
                       <td className="p-4">
                          <div className="flex flex-col items-start">
                             {/* คลิกชื่อแล้วไปแชท */}
                             <button 
                                onClick={() => startChat(report.targetUser?._id, report.targetUser?.name, report.targetUser?.profilePicture)}
                                className="font-semibold text-slate-700 hover:text-indigo-600 hover:underline flex items-center gap-1"
                             >
                                {report.targetUser?.name} <MessageCircle size={12} className="text-slate-300"/>
                             </button>
                             <span className="text-xs text-slate-400">Violation: {report.targetUser?.violationCount}</span>
                          </div>
                       </td>
                       <td className="p-4">
                          {report.status === 'resolved' ? (
                             <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                <CheckCircle2 size={12}/> ผิดจริง
                             </span>
                          ) : (
                             <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                <XCircle size={12}/> ยกฟ้อง
                             </span>
                          )}
                       </td>
                       <td className="p-4 text-right">
                          <button onClick={() => setSelectedReport(report)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-3 py-1.5 border border-indigo-100 rounded-lg hover:bg-indigo-50">
                             ดูข้อมูล
                          </button>
                       </td>
                    </tr>
                 ))}
                 {filteredReports.length === 0 && (
                    <tr>
                       <td colSpan={5} className="p-8 text-center text-slate-400">ไม่พบประวัติการรายงาน</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
      {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  )
}

export const AdminIncomingReports = () => <AdminReportPage isHistory={false} />
export const AdminReportHistory = () => <AdminReportPage isHistory={true} />