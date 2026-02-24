'use client'

import { ImagePlus } from 'lucide-react'

export default function ImportSection()
{
  return (
    <div className="min-h-52.5 rounded-xl border border-dashed border-gray-300 px-4 py-5">
      <div className="flex h-full min-h-36.25 flex-col items-center justify-center text-center">
        <ImagePlus className="h-8 w-8 text-gray-300" aria-hidden="true" />
         <label className="mt-3 inline-flex cursor-pointer text-lg font-semibold text-blue-600">
         <input type="file" accept=".csv" className="sr-only" />
            Upload CSV file
         </label>
        <p className="mt-1 text-[11px] font-semibold text-gray-400">or drag and drop</p>
        <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
          CSV with latitude, longitude, subtotal
        </p>
      </div>
    </div>
  )
}
