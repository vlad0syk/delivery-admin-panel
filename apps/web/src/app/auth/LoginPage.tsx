import { useState, type FormEvent } from "react"
import { Navigate } from "react-router-dom"
import axios from "axios"
import AuthLayout from "./AuthLayout"
import AuthCard from "../../components/auth/AuthCard"
import LoginForm from "../../components/auth/LoginForm"
import AuthHeader from "../../components/auth/AuthHeader"
import { useAuth } from "../../provider/authProvider"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (e: FormEvent) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    setError(null)
    setLoading(true)

    try {
      const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      await axios.post(`${API_BASE}/auth/login`, { email, password })
      login(email)
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-['Inter']">
      <AuthLayout>
        <AuthHeader />
        <AuthCard>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </AuthCard>
      </AuthLayout>
    </div>
  )
}
