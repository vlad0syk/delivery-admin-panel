'use client'

import { ImagePlus } from 'lucide-react'

export default function ImportSection() {
  return (
    <div className="min-h-[250px] rounded-xl border border-dashed border-gray-300 px-5 py-6">
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
        <ImagePlus className="h-10 w-10 text-gray-300" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-blue-600">
          Upload CSV file
        </p>
        <p className="mt-1 text-[11px] font-semibold text-gray-400">or drag and drop</p>
        <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
          CSV with latitude, longitude, subtotal
        </p>
      </div>
    </div>
  )
}
