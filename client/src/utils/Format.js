export function FormatDate(dateString) {
  if (!dateString) return "-"
  const d = new Date(dateString)

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear() + 543

  return `${day}/${month}/${year}`
}

export function formatPhone(value = "") {
  const digits = value.replace(/\D/g, "").slice(0, 10)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function formatRelativeTime(dateString) {
  if (!dateString) return ""
  const now = new Date()
  const target = new Date(dateString)
  if (isNaN(target.getTime())) return "-"
  const diff = target - now
  const abs = Math.abs(diff)
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  const past = diff < 0

  const wrap = (text) => `(${text})`
  const format = (num, unit) => wrap(past ? `${num} ${unit}ที่แล้ว` : `อีก ${num} ${unit}`)
  if (abs < minute) return wrap(past ? "เมื่อสักครู่" : "อีกสักครู่")
  if (abs < hour) return format(Math.floor(abs / minute), "นาที")
  if (abs < day) return format(Math.floor(abs / hour), "ชั่วโมง")
  const days = Math.floor(abs / day)
  if (days === 1) return wrap(past ? "เมื่อวาน" : "พรุ่งนี้")
  if (days < 14) return format(days, "วัน")
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return format(weeks, "สัปดาห์")
  const months = Math.floor(days / 30)
  if (months < 12) return format(months, "เดือน")
  const years = Math.floor(days / 365)
  return format(years, "ปี")
}


export function formatPrice(price) {
  return new Intl.NumberFormat("th-TH").format(price)
}

export function formatMoney(amount) {
  return Number(amount).toLocaleString("th-TH")
}
