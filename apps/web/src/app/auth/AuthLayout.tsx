import type { ReactNode } from "react"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f1f4f9] flex flex-col items-center justify-center px-4 pb-15 bg-gradient-to-b from-slate-50 to-slate-100">
      {children}
    </div>
  )
}