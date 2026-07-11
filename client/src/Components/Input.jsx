import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

const baseStyle = `
  w-full bg-slate-50 border rounded-xl text-slate-900
  focus:outline-none focus:ring-2 transition-all duration-200
`
const errorStyle = `border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30`
const normalStyle = `border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 hover:border-slate-300`

export default function Input({ as = "input", label, name, value, onChange, type = "text", placeholder, icon: Icon, error, options = [], rows = 3, passwordToggle = false, min, max, }) {
  const [showPassword, setShowPassword] = useState(false)

  /* ---------- RADIO ---------- */
  if (as === "radio") {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
        <div className="flex gap-4">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {error && <ErrorText error={error} />}
      </div>
    )
  }

  /* ---------- COMMON ---------- */
  const commonProps = {
    name,
    value,
    onChange,
    placeholder,
    min,
    max,
    className: `
      ${baseStyle}
      ${Icon ? "pl-10" : "pl-4"} pr-${passwordToggle ? "10" : "4"} py-3
      ${error ? errorStyle : normalStyle}
    `,
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}

      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? "text-red-400" : "text-slate-400 group-focus-within:text-indigo-500"}`} />
          </div>
        )}

        {/* INPUT */}
        {as === "input" && <input {...commonProps} type={passwordToggle ? (showPassword ? "text" : "password") : type} />}

        {/* TEXTAREA */}
        {as === "textarea" && (
          <textarea {...commonProps} rows={rows} className={`${commonProps.className} auto-grow resize-y transition-[height] duration-200 ease-in-out`}
            // onInput={(e) => {
            //   e.target.style.height = "auto"
            //   e.target.style.height = e.target.scrollHeight + "px"
            // }}
          />
        )}

        {/* SELECT */}
        {as === "select" && (
          <select {...commonProps} className={`${commonProps.className} appearance-none`}>
            <option value="">เลือก{label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* PASSWORD TOGGLE */}
        {passwordToggle && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <ErrorText error={error} />}
    </div>
  )
}

/* ---------- ERROR TEXT ---------- */
const ErrorText = ({ error }) => (
  <p className="text-red-500 text-xs font-medium flex items-center gap-1 ml-1">
    <span className="w-1 h-1 rounded-full bg-red-500" />
    {error}
  </p>
)

// How to Use:

// Text / Password
// <Input
//   label="รหัสผ่าน"
//   name="password"
//   value={password}
//   onChange={handleChange}
//   icon={Lock}
//   passwordToggle
//   error={errors.password}
// />

// Select
// <Input
//   as="select"
//   label="เพศ"
//   name="gender"
//   value={gender}
//   onChange={handleChange}
//   icon={User}
//   options={[
//     { value: "male", label: "ชาย" },
//     { value: "female", label: "หญิง" },
//   ]}
// />

// Textarea
// <Input
//   as="textarea"
//   label="รายละเอียด"
//   name="detail"
//   value={detail}
//   onChange={handleChange}
//   icon={FileText}
// />

// radio
// <Input
//   as="radio"
//   label="สถานะ"
//   name="status"
//   value={status}
//   onChange={handleChange}
//   options={[
//     { value: "active", label: "ใช้งาน" },
//     { value: "inactive", label: "ไม่ใช้งาน" },
//   ]}
// />
