"use client"

type OrderRowProps = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
  onViewDetails: () => void
}

export default function OrderRow({
  orderId,
  locationLine1,
  locationLine2,
  subtotal,
  taxRate,
  taxAmount,
  total,
  onViewDetails,
}: OrderRowProps) {
  return (
    <div className="grid grid-cols-[1.1fr_2fr_repeat(4,minmax(0,1fr))_1.4fr] items-center border-b border-gray-200 px-4 py-3 text-sm last:border-b-0 md:px-5">
      <div className="font-semibold text-gray-900">{orderId}</div>

      <div className="space-y-0.5">
        <div className="text-gray-800">{locationLine1}</div>
        <div className="text-xs text-gray-500">{locationLine2}</div>
      </div>

      <div className="font-semibold text-gray-800">{subtotal}</div>
      <div className="font-semibold text-gray-800">{taxRate}</div>
      <div className="font-semibold text-gray-800">{taxAmount}</div>
      <div className="font-semibold text-gray-900">{total}</div>

      <button
        type="button"
        onClick={onViewDetails}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        View Details
      </button>
    </div>
  )
}
