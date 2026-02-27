import { useEffect } from "react"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-4">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[20px] bg-[#f8f8f8] shadow-2xl sm:max-h-none sm:overflow-visible">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-xl font-semibold tracking-tight text-gray-950">
            {title ?? "Details"}
          </h2>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {children}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
