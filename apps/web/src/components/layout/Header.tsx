'use client'

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[32px] leading-none font-extrabold tracking-[-0.02em] text-gray-900">
            BetterMe
          </span>
          <span className="text-sm font-medium text-gray-400">
            Tax Calculator Admin
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-600">admin@betterme.com</span>
          <button className="font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
