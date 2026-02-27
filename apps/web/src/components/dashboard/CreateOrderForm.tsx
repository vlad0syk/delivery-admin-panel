'use client'

import { useState } from "react"

const COORD_REGEX = /^-?\d*[.,]?\d*$/
const MONEY_REGEX = /^\d*[.,]?\d{0,2}$/

export default function CreateOrderForm() {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [subtotal, setSubtotal] = useState("")

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

  return (
    <form className="rounded-xl border border-gray-300 bg-white px-4 py-5">
      <h3 className="text-lg font-semibold text-gray-900">Create Order Manually</h3>

      <label className="mt-3 block text-sm font-semibold text-gray-700">
        Latitude
        <input
         type="text"
         inputMode="decimal"
         pattern="^-?\\d*[\\.,]?\\d*$"
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
          pattern="^-?\\d*[\\.,]?\\d*$"
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
         pattern="^\\d*[\\.,]?\\d{0,2}$"
         value={subtotal}
         onChange={onMoneyChange}
          className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
        />
      </label>

      <button
        type="button"
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Create Order
      </button>
    </form>
  )
}
