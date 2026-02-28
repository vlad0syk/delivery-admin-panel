import { useEffect, useId } from "react"
import type { MouseEvent } from "react"

type CreateOrderErrorModalProps = {
  isOpen: boolean
  errors: string[]
  onClose: () => void
  onFix?: () => void
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function splitError(error: string) {
  const match = /^(latitude|longitude|subtotal)/i.exec(error.trim())

  if (!match) return { field: null as string | null, message: error.trim() }

  const field = capitalize(match[1])
  const remainder = error.trim().slice(match[0].length).trim()

  return {
    field,
    message: remainder.length > 0 ? remainder : null,
  }
}

export default function CreateOrderErrorModal({
  isOpen,
  errors,
  onClose,
  onFix,
}: CreateOrderErrorModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleFixClick = () => {
    if (onFix) {
      onFix()
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center px-7 pb-7 pt-8 text-center sm:px-9 sm:pt-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe9e7] text-[#f04438]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="12" cy="12" r="9.25" className="stroke-current" />
              <path d="M12 7.25v5.5" className="stroke-current" strokeLinecap="round" />
              <circle cx="12" cy="16.25" r="0.8" className="fill-current" />
            </svg>
          </div>

          <h2 id={titleId} className="mt-4 text-xl font-semibold text-gray-900 sm:text-2xl">
            Invalid Order Data
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-500 sm:text-base">
            Please correct the fields below before creating your order.
          </p>

          <div className="mt-5 w-full space-y-3">
            {errors.map((error, index) => {
              const formatted = splitError(error)

              return (
                <div
                  key={`${error}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-[#f8d7d7] bg-[#fff6f5] px-3 py-2.5 text-left text-sm text-[#c4322b] shadow-[0_2px_12px_rgba(244,68,56,0.12)]"
                >
                  <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-[#f97066]" />
                  <p className="leading-relaxed">
                    {formatted.field ? (
                      <>
                        <span className="font-semibold text-[#c4322b]">{formatted.field}</span>
                        {formatted.message ? ` ${formatted.message}` : null}
                      </>
                    ) : (
                      error
                    )}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row">
            <button
              type="button"
              onClick={handleFixClick}
              className="h-11 w-full rounded-xl bg-[#1f7aff] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(33,107,255,0.35)] transition hover:bg-[#1a6ad8]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
