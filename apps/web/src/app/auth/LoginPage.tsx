import AuthLayout from "./AuthLayout"
import AuthCard from "../../components/auth/AuthCard"
import LoginForm from "../../components/auth/LoginForm"
import AuthHeader from "../../components/auth/AuthHeader"
export default function LoginPage() {
  return (

    <div className="font-['Inter']">
      <AuthLayout>
        <AuthHeader />
        <AuthCard>
          <LoginForm />
        </AuthCard>
      </AuthLayout>
    </div>
  )
}    
