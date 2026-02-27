'use client'

import { useRef, useState } from "react"
import { ImagePlus } from "lucide-react"

export default function ImportSection() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const isCsvFile = (file: File) =>
    file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const first = files[0]
    if (!isCsvFile(first)) return
    setFileName(first.name)
  }

  return (
    <button
      type="button"
      onClick={openFileDialog}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFiles(event.dataTransfer.files)
      }}
      className={`min-h-52.5 w-full rounded-xl border border-dashed px-4 py-5 text-left transition ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 bg-white"
      }`}
      aria-label="Upload CSV file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div className="flex h-full min-h-36.25 flex-col items-center justify-center text-center">
        <ImagePlus className="h-8 w-8 text-gray-300" aria-hidden="true" />
        <span className="mt-3 inline-flex text-lg font-semibold text-blue-600">
          Upload CSV file
        </span>
        <p className="mt-1 text-[11px] font-semibold text-gray-400">
          or drag and drop
        </p>
        <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
          CSV with latitude, longitude, subtotal
        </p>
        {fileName ? (
          <p className="mt-2 text-xs font-semibold text-gray-600">
            Selected: {fileName}
          </p>
        ) : null}
      </div>
    </button>
  )
}
