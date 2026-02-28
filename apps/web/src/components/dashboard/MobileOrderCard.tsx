import { Pencil, Trash2 } from "lucide-react"

type MobileOrderCardProps = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
  timestamp: string
  isSelected: boolean
  onToggleSelect: () => void
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function MobileOrderCard({
  orderId,
  locationLine1,
  locationLine2,
  subtotal,
  taxRate,
  taxAmount,
  total,
  timestamp,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onEdit,
  onDelete,
}: MobileOrderCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{orderId}</div>
              <div className="mt-1 text-sm text-gray-700">{locationLine1}</div>
              <div className="text-xs text-gray-500">{locationLine2}</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onViewDetails}
                className="whitespace-nowrap text-sm font-semibold text-blue-600"
              >
                View
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                title="Edit order"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete order"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Subtotal:</span> <span className="font-semibold">{subtotal}</span></div>
            <div><span className="text-gray-500">Tax rate:</span> <span className="font-semibold">{taxRate}</span></div>
            <div><span className="text-gray-500">Tax:</span> <span className="font-semibold">{taxAmount}</span></div>
            <div><span className="text-gray-500">Total:</span> <span className="font-semibold">{total}</span></div>
          </div>

          <div className="mt-2 text-xs text-gray-400">{timestamp}</div>
        </div>
      </div>
    </div>
  )
}
