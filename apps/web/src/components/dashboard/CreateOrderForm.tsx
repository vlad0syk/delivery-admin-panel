'use client'

import { useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { createOrder, notifyOrdersUpdated } from "@/api"
import CreateOrderErrorModal from "../ui/CreateOrderErrorModal"

const COORD_REGEX = /^-?\d*[.,]?\d*$/
const MONEY_REGEX = /^\d*[.,]?\d{0,2}$/

export default function CreateOrderForm() {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [subtotal, setSubtotal] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  const latInputRef = useRef<HTMLInputElement>(null)
  const lngInputRef = useRef<HTMLInputElement>(null)
  const subtotalInputRef = useRef<HTMLInputElement>(null)

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

  const openErrorModal = (messages: string[]) => {
    setErrorMessages(messages)
    setIsErrorModalOpen(true)
  }

  const handleSubmit = async () => {
    const validationErrors: string[] = []

    const toNumber = (value: string) => Number(value.replace(",", "."))

    if (!latitude.trim()) {
      validationErrors.push("Latitude is required")
    }
    if (!longitude.trim()) {
      validationErrors.push("Longitude is required")
    }
    if (!subtotal.trim()) {
      validationErrors.push("Subtotal is required")
    }

    const latitudeValue = toNumber(latitude)
    const longitudeValue = toNumber(longitude)
    const subtotalValue = toNumber(subtotal)

    if (Number.isFinite(latitudeValue)) {
      if (latitudeValue < -90 || latitudeValue > 90) {
        validationErrors.push("Latitude must be between -90 and 90")
      }
    } else if (latitude.trim()) {
      validationErrors.push("Latitude must be between -90 and 90")
    }

    if (Number.isFinite(longitudeValue)) {
      if (longitudeValue < -180 || longitudeValue > 180) {
        validationErrors.push("Longitude must be between -180 and 180")
      }
    } else if (longitude.trim()) {
      validationErrors.push("Longitude must be between -180 and 180")
    }

    if (Number.isFinite(subtotalValue)) {
      if (subtotalValue <= 0) {
        validationErrors.push("Subtotal must be a positive number")
      }
    } else if (subtotal.trim()) {
      validationErrors.push("Subtotal must be a positive number")
    }

    if (validationErrors.length > 0) {
      setSuccess(null)
      openErrorModal(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSuccess(null)

    try {
      await createOrder({ latitude, longitude, subtotal })
      setLatitude("")
      setLongitude("")
      setSubtotal("")
      setSuccess("Order created successfully")
      notifyOrdersUpdated()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create order"
      openErrorModal([message])
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
          ref={latInputRef}
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
          ref={lngInputRef}
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
          ref={subtotalInputRef}
          onChange={onMoneyChange}
          className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
        />
      </label>
      {success ? <p className="mt-2 text-sm text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Creating..." : "Create Order"}
      </button>

      <CreateOrderErrorModal
        isOpen={isErrorModalOpen}
        errors={errorMessages}
        onClose={() => setIsErrorModalOpen(false)}
        onFix={() => {
          setIsErrorModalOpen(false)

          const firstError = errorMessages[0]?.toLowerCase() ?? ""
          if (firstError.includes("latitude")) {
            latInputRef.current?.focus()
          } else if (firstError.includes("longitude")) {
            lngInputRef.current?.focus()
          } else if (firstError.includes("subtotal")) {
            subtotalInputRef.current?.focus()
          }
        }}
      />
    </form>
  )
}
