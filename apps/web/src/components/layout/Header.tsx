import { useNavigate } from "react-router-dom"
import { useAuth } from "../../provider/authProvider"

export default function Header() {
  const { setToken } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    setToken(null)
    navigate("/login", { replace: true })
  }

  return (
  <header className="w-full bg-white border-b border-gray-200">
    <div className="max-w-300 mx-auto px-6 py-3 sm:py-0 sm:h-16 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      
      <div className="flex items-center gap-3">
        <span className="font-['Inter'] text-xl sm:text-2xl lg:text-3xl leading-tight font-extrabold tracking-tight text-gray-900">
          Admin Delivery Panel
        </span>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs sm:text-sm">
        <span className="font-medium text-gray-600 truncate max-w-[60vw] sm:max-w-none">
          admin@betterme.com
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="font-medium text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
        >
          Logout
        </button>
      </div>

    </div>
  </header>
)
}
