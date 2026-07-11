import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import Main from "./Pages/Main"
import RegisterPage from "./Pages/Login/RegisterPage"
import Login from "./Pages/Login/Login"
import JobDetail from "./Pages/JobDetail"
import Chat from "./Pages/Chat"
import MyProfile from "./Pages/Menu/MyProfile"
import Settings from "./Pages/Menu/Settings"
import WebLayout from "./layouts/WebLayout"
import ForgotPassword from "./Pages/Login/ForgotPassword"
import JobBoard from "./Pages/JobBoard"
import DetailFreelancer from "./Pages/DetailFreelancer"
import { LoadingProvider } from "./context/LoadingContext"
import Profile from "./Pages/Profile"

import AdminProfile from "./Pages/Admin/AdminProfile"
import AdminLayout from './layouts/AdminLayout';
import AdminUsers from "./Pages/Admin/AdminUsers"
import { AdminIncomingReports, AdminReportHistory } from "./Pages/Admin/AdminReports"
import GuidePage from "./Pages/Menu/Guide"
import ScrollToTop from "./Components/ScrollToTop";

const ProtectedRoute = ({ allowedRoles }) => {
  const userStr = localStorage.getItem("user")
  const user = userStr ? JSON.parse(userStr) : null

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LoadingProvider>
        <Routes>
          <Route element={<WebLayout />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={<Main />} />
            <Route path="/detailfreelancer/:id" element={<DetailFreelancer />} />
            <Route path="/detailfreelancer" element={<DetailFreelancer />} />

            <Route path="/job/:id" element={<JobDetail />} />

            <Route path="/myprofile" element={<MyProfile />} />
            <Route path="/profile/:id" element={<Profile />} />

            <Route path="/chat" element={<Chat />} />
            

            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/jobboard" element={<JobBoard />} />

          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="adminprofile" element={<AdminProfile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminIncomingReports />} />
              <Route path="report-history" element={<AdminReportHistory />} />
            </Route>
          </Route>
        </Routes>
      </LoadingProvider>
    </Router>
  )
}

export default App
