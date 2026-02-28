import { useEffect } from "react"

type ConfirmDialogProps = {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "default"
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (!isOpen) return

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }

        document.addEventListener("keydown", handleEsc)
        document.body.style.overflow = "hidden"

        return () => {
            document.removeEventListener("keydown", handleEsc)
            document.body.style.overflow = "auto"
        }
    }, [isOpen, onCancel])

    if (!isOpen) return null

    const confirmStyles =
        variant === "danger"
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-4">
            <div className="w-full max-w-sm rounded-[20px] bg-[#f8f8f8] shadow-2xl">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                        {title}
                    </h2>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-gray-600">{message}</p>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${confirmStyles}`}
                        >
                            {isLoading ? "..." : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
