import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // สั่งให้หน้าต่างบราวเซอร์เลื่อนไปที่พิกัด X=0, Y=0 (บนสุด ซ้ายสุด)
    window.scrollTo(0, 0);
    
    // หรือถ้าอยากให้มันเลื่อนขึ้นแบบนุ่มนวล (Smooth) ให้ใช้แบบนี้ครับ:
    // window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]); // ให้ทำงานทุกครั้งที่ pathname (ที่อยู่ URL) เปลี่ยนแปลง

  return null; // Component นี้ไม่ต้องแสดงหน้าตาอะไร ออกแบบมาเพื่อรัน Logic อย่างเดียว
};

export default ScrollToTop;