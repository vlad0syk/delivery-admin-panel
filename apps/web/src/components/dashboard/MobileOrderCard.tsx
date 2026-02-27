type OrderRowProps = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
}

export default function MobileOrderCard({
  orderId,
  locationLine1,
  locationLine2,
  subtotal,
  taxRate,
  taxAmount,
  total,
}: OrderRowProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900">{orderId}</div>
          <div className="mt-1 text-sm text-gray-700">{locationLine1}</div>
          <div className="text-xs text-gray-500">{locationLine2}</div>
        </div>

        <button className="text-sm font-semibold text-blue-600 whitespace-nowrap">
          View Details
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-gray-500">Subtotal:</span> <span className="font-semibold">{subtotal}</span></div>
        <div><span className="text-gray-500">Tax rate:</span> <span className="font-semibold">{taxRate}</span></div>
        <div><span className="text-gray-500">Tax:</span> <span className="font-semibold">{taxAmount}</span></div>
        <div><span className="text-gray-500">Total:</span> <span className="font-semibold">{total}</span></div>
      </div>
    </div>
  )
}