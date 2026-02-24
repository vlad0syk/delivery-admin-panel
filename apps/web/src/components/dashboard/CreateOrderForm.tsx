'use client'

export default function CreateOrderForm()
{
  return (
    <form className="rounded-xl border border-gray-300 bg-white px-4 py-5">
      <h3 className="text-lg font-semibold text-gray-900">Create Order Manually</h3>

      <label className="mt-3 block text-sm font-semibold text-gray-700">
        Latitude
        <input
          type="text"
          className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold text-gray-700">
        Longitude
        <input
          type="text"
          className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none transition focus:border-blue-300"
        />
      </label>

      <label className="mt-3 block text-sm font-semibold text-gray-700">
        Subtotal ($)
        <input
          type="text"
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
