import AuthLayout from  "./AuthLayout"
import AuthCard from "../../components/auth/AuthCard"
import LoginForm from "../../components/auth/LoginForm"
import AuthHeader from "../../components/auth/AuthHeader"
export default function LoginPage() {
  return (

    <div className="font-['Inter']">
      <AuthLayout>
         <AuthHeader />
          <AuthCard
          >
            <LoginForm />
          </AuthCard>
          <p className="mt-5 text-center text-xs text-gray-400">Unauthorized access is prohibited.<br />System activity is monitored.</p>
      </AuthLayout>
    </div>
  )
}    