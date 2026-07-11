import { Outlet } from "react-router-dom"
import Navbar from "../Components/Navbar"

export default function WebLayout() {

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 font-['Prompt',sans-serif]">
      <Navbar />

      {/* background effect */}
      <div className="flex-1 fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <main className="flex flex-1 ">
        <Outlet />
      </main>
    </div>
  )
}
