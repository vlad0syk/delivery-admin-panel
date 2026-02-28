'use client'

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, FileText, Trash2, X } from "lucide-react"
import { APP_TOAST_EVENT, type AppToastPayload } from "@/toast"

const TOAST_DURATION_MS = 4200
const TOAST_EXIT_MS = 240

type ActiveToast = AppToastPayload & { id: number }

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ActiveToast
  onRemove: (id: number) => void
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const hideTimerRef = useRef<number | null>(null)
  const removeTimerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    frameRef.current = window.requestAnimationFrame(() => {
      setIsVisible(true)
      frameRef.current = window.requestAnimationFrame(() => {
        setProgress(0)
      })
    })

    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false)
      removeTimerRef.current = window.setTimeout(() => {
        onRemove(toast.id)
      }, TOAST_EXIT_MS)
    }, TOAST_DURATION_MS)

    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current)
      }
      if (removeTimerRef.current != null) {
        window.clearTimeout(removeTimerRef.current)
      }
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [onRemove, toast.id])

  const dismissToast = () => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
    }
    if (removeTimerRef.current != null) {
      window.clearTimeout(removeTimerRef.current)
    }
    setIsVisible(false)
    removeTimerRef.current = window.setTimeout(() => {
      onRemove(toast.id)
    }, TOAST_EXIT_MS)
  }

  const Icon =
    toast.variant === "import"
      ? FileText
      : toast.variant === "delete" || toast.variant === "delete-all"
        ? Trash2
        : CheckCircle2

  const iconClasses =
    toast.variant === "import"
      ? "bg-blue-100 text-blue-600"
      : toast.variant === "delete" || toast.variant === "delete-all"
        ? "bg-red-100 text-red-500"
        : "bg-emerald-100 text-emerald-600"

  const titleClasses =
    toast.variant === "delete" || toast.variant === "delete-all"
      ? "text-red-600"
      : "text-slate-800"

  const messageClasses =
    toast.variant === "delete" || toast.variant === "delete-all"
      ? "text-red-500"
      : "text-slate-500"

  const barClasses =
    toast.variant === "import"
      ? "bg-blue-500"
      : toast.variant === "delete" || toast.variant === "delete-all"
        ? "bg-red-500"
        : "bg-emerald-500"

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] transition-all duration-200 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xl font-semibold leading-6 ${titleClasses}`}>
            {toast.title}
          </p>
          <p className={`mt-0.5 text-sm leading-5 ${messageClasses}`}>
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
          className={`h-full ${barClasses}`}
          style={{
            width: `${progress}%`,
            transition: `width ${TOAST_DURATION_MS}ms linear`,
          }}
        />
      </div>
    </div>
  )
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastPayload>

      setToasts((current) => [
        ...current,
        {
          ...customEvent.detail,
          id: Date.now() + Math.floor(Math.random() * 1000),
        },
      ])
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast)
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast)
  }, [])

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  if (!toasts.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-[22rem] flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
