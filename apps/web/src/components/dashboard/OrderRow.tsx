"use client"

import { Pencil, Trash2 } from "lucide-react"

type OrderRowProps = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
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
  onEdit,
  onDelete,
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title="Edit order"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Delete order"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
