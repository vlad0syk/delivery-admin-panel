'use client'

import { useEffect, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, FileText, X } from "lucide-react"
import { APP_TOAST_EVENT, type AppToastPayload } from "@/toast"

const TOAST_DURATION_MS = 4200
const TOAST_EXIT_MS = 240

export default function ToastProvider() {
  const [toast, setToast] = useState<(AppToastPayload & { id: number }) | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const hideTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current)
      }
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current)
      }
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }

    const closeToast = () => {
      setIsVisible(false)
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current)
      }
      clearTimerRef.current = window.setTimeout(() => {
        setToast(null)
        setProgress(100)
      }, TOAST_EXIT_MS)
    }

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastPayload>
      clearTimers()

      setToast({
        ...customEvent.detail,
        id: Date.now(),
      })
      setProgress(100)
      setIsVisible(false)

      frameRef.current = window.requestAnimationFrame(() => {
        setIsVisible(true)
        frameRef.current = window.requestAnimationFrame(() => {
          setProgress(0)
        })
      })

      hideTimerRef.current = window.setTimeout(closeToast, TOAST_DURATION_MS)
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast)

    return () => {
      clearTimers()
      window.removeEventListener(APP_TOAST_EVENT, handleToast)
    }
  }, [])

  const dismissToast = () => {
    if (!toast) return
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
    }
    setIsVisible(false)
    if (clearTimerRef.current != null) {
      window.clearTimeout(clearTimerRef.current)
    }
    clearTimerRef.current = window.setTimeout(() => {
      setToast(null)
      setProgress(100)
    }, TOAST_EXIT_MS)
  }

  if (!toast) {
    return null
  }

  const Icon = toast.variant === "import" ? FileText : toast.variant === "error" ? AlertCircle : CheckCircle2
  const iconClasses =
    toast.variant === "import"
      ? "bg-blue-100 text-blue-600"
      : toast.variant === "error"
        ? "bg-red-100 text-red-600"
        : "bg-emerald-100 text-emerald-600"

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-[22rem] sm:right-6 sm:top-6">
      <div
        className={`pointer-events-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] transition-all duration-200 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold leading-6 text-slate-800">
              {toast.title}
            </p>
            <p className="mt-0.5 text-sm leading-5 text-slate-500">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-500"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="h-1 w-full bg-slate-100">
          <div
            className={`h-full ${toast.variant === "import" ? "bg-blue-500" : toast.variant === "error" ? "bg-red-500" : "bg-emerald-500"
              }`}
            style={{
              width: `${progress}%`,
              transition: `width ${TOAST_DURATION_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
