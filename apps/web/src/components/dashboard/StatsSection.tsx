'use client'

import { ClipboardList, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function StatsSection()
{
  return (
    <section className="max-w-300 mx-auto px-6 pt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Orders</p>
            <p className="mt-1 text-xl font-bold text-gray-900">XXXX</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500">
            <DollarSign className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Total Tax Collected
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">$XXXX.XX</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Avg Tax Rate</p>
            <p className="mt-1 text-xl font-bold text-gray-900">X.XXX%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">
              Time Remaining
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">XXh XXm</p>
          </div>
        </div>
      </div>
    </section>
  )
}
