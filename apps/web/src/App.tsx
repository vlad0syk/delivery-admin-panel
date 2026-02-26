import { Navigate, Route, Routes } from "react-router-dom"
import AdminPage from "./app/admin/AdminPage"
import LoginPage from "./app/auth/LoginPage"

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App;