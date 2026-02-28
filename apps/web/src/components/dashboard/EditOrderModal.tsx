import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { updateOrder, notifyOrdersUpdated } from "@/api"

type EditOrderModalProps = {
    isOpen: boolean
    orderId: string
    initialLatitude: string
    initialLongitude: string
    initialSubtotal: string
    onClose: () => void
}

const COORD_REGEX = /^-?\d*[.,]?\d*$/
const MONEY_REGEX = /^\d*[.,]?\d{0,2}$/

export default function EditOrderModal({
    isOpen,
    orderId,
    initialLatitude,
    initialLongitude,
    initialSubtotal,
    onClose,
}: EditOrderModalProps) {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [subtotal, setSubtotal] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setLatitude(initialLatitude)
            setLongitude(initialLongitude)
            setSubtotal(initialSubtotal.replace("$", ""))
            setError(null)
        }
    }, [isOpen, initialLatitude, initialLongitude, initialSubtotal])

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

    const onCoordChange =
        (setter: (value: string) => void) =>
            (event: ChangeEvent<HTMLInputElement>) => {
                const next = event.target.value.replace(/\s+/g, "")
                if (next === "" || COORD_REGEX.test(next)) {
                    setter(next)
                }
            }

    const onMoneyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value.replace(/\s+/g, "")
        if (next === "" || MONEY_REGEX.test(next)) {
            setSubtotal(next)
        }
    }

    const handleSubmit = async () => {
        const toNumber = (value: string) => Number(value.replace(",", "."))

        const latVal = toNumber(latitude)
        const lngVal = toNumber(longitude)
        const subVal = toNumber(subtotal)

        if (!Number.isFinite(latVal) || latVal < -90 || latVal > 90) {
            setError("Latitude must be between -90 and 90")
            return
        }
        if (!Number.isFinite(lngVal) || lngVal < -180 || lngVal > 180) {
            setError("Longitude must be between -180 and 180")
            return
        }
        if (!Number.isFinite(subVal) || subVal <= 0) {
            setError("Subtotal must be a positive number")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await updateOrder(orderId, {
                latitude: latVal,
                longitude: lngVal,
                subtotal: subVal,
            })
            notifyOrdersUpdated()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update order")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    const isDisabled = isSubmitting || !latitude || !longitude || !subtotal

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-4">
            <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[20px] bg-[#f8f8f8] shadow-2xl sm:max-h-none sm:overflow-visible">
                <div className="border-b border-gray-200 px-4 py-3 sm:px-5 sm:py-4">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-950">
                        Edit Order
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">ID: {orderId}</p>
                </div>

                <form
                    className="px-4 py-4 sm:px-5 sm:py-5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        void handleSubmit()
                    }}
                >
                    <label className="block text-sm font-semibold text-gray-700">
                        Latitude
                        <input
                            type="text"
                            inputMode="decimal"
                            value={latitude}
                            onChange={onCoordChange(setLatitude)}
                            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
                        />
                    </label>

                    <label className="mt-3 block text-sm font-semibold text-gray-700">
                        Longitude
                        <input
                            type="text"
                            inputMode="decimal"
                            value={longitude}
                            onChange={onCoordChange(setLongitude)}
                            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
                        />
                    </label>

                    <label className="mt-3 block text-sm font-semibold text-gray-700">
                        Subtotal ($)
                        <input
                            type="text"
                            inputMode="decimal"
                            value={subtotal}
                            onChange={onMoneyChange}
                            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
                        />
                    </label>

                    {error ? (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    ) : null}

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
