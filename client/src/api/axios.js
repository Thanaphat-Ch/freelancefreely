import axios from "axios"
import Swal from "sweetalert2" 
import { loadingStore } from "../stores/loadingstore"

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
  timeout: 10000,
  withCredentials: true,
})

let requestCount = 0

api.interceptors.request.use(
  (config) => {
    requestCount++
    loadingStore.show()
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    requestCount--
    if (requestCount === 0) loadingStore.hide()
    return response
  },
  async (error) => { 
    requestCount--
    if (requestCount === 0) loadingStore.hide()


    if (!error.response) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง'
      })
      return Promise.reject(error)
    }

    const status = error.response.status
    const data = error.response.data

    if (status === 401) {
      const isLoginApi = error.config?.url?.includes("/login")

      if (isLoginApi) {

        console.warn(data.message || "Login failed")
      } else {

        await Swal.fire({
            icon: 'warning',
            title: 'Session หมดอายุ',
            text: 'กรุณาเข้าสู่ระบบใหม่',
            confirmButtonText: 'ไปหน้าล็อกอิน',
            allowOutsideClick: false // บังคับกดปุ่ม
        })

        localStorage.removeItem("user")
        localStorage.removeItem("profilePic")
        window.location.href = "/login"
      }
    }

    if (status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลในส่วนนี้',
        confirmButtonText: 'ตกลง'
      })
    }

    if (status === 404) {
      console.warn("ไม่พบข้อมูลหรือ API")
    }

    if (status >= 500) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'ระบบมีปัญหา กรุณาลองใหม่ภายหลัง',
        confirmButtonText: 'ตกลง'
      })
    }

    if (status === 400) {
      console.log(error?.response?.data)
    }

    return Promise.reject(error)
  }
)

export default api