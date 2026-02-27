import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "./AuthLayout"
import AuthCard from "../../components/auth/AuthCard"
import LoginForm from "../../components/auth/LoginForm"
import AuthHeader from "../../components/auth/AuthHeader"
import { login } from "@/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await login({ email, password })
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="font-['Inter']">
      <AuthLayout>
        <AuthHeader />
        <AuthCard>
          <div className="space-y-3">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <LoginForm
              onSubmit={(event) => {
                void handleSubmit(event as React.FormEvent<HTMLFormElement>)
              }}
            />
            {isSubmitting ? (
              <p className="text-xs text-gray-500">Signing in...</p>
            ) : null}
          </div>
        </AuthCard>
      </AuthLayout>
    </div>
  )
}
