'use client'

import { useState } from "react"
import { createOrder, notifyOrdersUpdated } from "@/api"
import { showToast } from "@/toast"

const COORD_REGEX = /^-?\d*[.,]?\d*$/
const MONEY_REGEX = /^\d*[.,]?\d{0,2}$/

export default function CreateOrderForm() {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [subtotal, setSubtotal] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCoordChange =
    (setter: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value.replace(/\s+/g, "")
      if (next === "" || COORD_REGEX.test(next)) {
        setter(next)
      }
    }

  const onMoneyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/\s+/g, "")
    if (next === "" || MONEY_REGEX.test(next)) {
      setSubtotal(next)
    }
  }

  const handleSubmit = async () => {
    if (!latitude || !longitude || !subtotal) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const order = await createOrder({ latitude, longitude, subtotal })
      setLatitude("")
      setLongitude("")
      setSubtotal("")
      showToast({
        title: "Order created",
        message: `lat ${order.location.latitude.toFixed(4)} | lng ${order.location.longitude.toFixed(4)} | $${Number(order.subtotal).toFixed(2)}`,
      })
      notifyOrdersUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || !latitude || !longitude || !subtotal

  return (
    <form
      className="rounded-xl border border-gray-300 bg-white px-4 py-5"
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit()
      }}
    >
      <h3 className="text-lg font-semibold text-gray-900">Create Order Manually</h3>

      <label className="mt-3 block text-sm font-semibold text-gray-700">
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

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating..." : "Create Order"}
      </button>
    </form>
  )
}
