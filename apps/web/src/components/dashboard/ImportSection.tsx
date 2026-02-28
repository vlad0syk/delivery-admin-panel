'use client'

import { useRef, useState } from "react"
import { ImagePlus } from "lucide-react"
import { importOrders, notifyOrdersUpdated } from "@/api"
import { showToast } from "@/toast"

export default function ImportSection() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const isCsvFile = (fileToCheck: File) =>
    fileToCheck.type === "text/csv" || fileToCheck.name.toLowerCase().endsWith(".csv")

  const importFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await importOrders(file)
      showToast({
        title: "CSV imported successfully",
        message: `${result.imported} orders loaded | ${result.failed} errors`,
        variant: "import",
      })
      notifyOrdersUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import orders")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const first = files[0]
    if (!isCsvFile(first)) {
      setError("Please select a CSV file")
      return
    }
    setFileName(first.name)
    void importFile(first)
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
        isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
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
          {isUploading ? "Importing..." : "or drag and drop"}
        </p>
        <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
          CSV with latitude, longitude, subtotal
        </p>
        {fileName ? (
          <p className="mt-2 text-xs font-semibold text-gray-600">
            Selected: {fileName}
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
      </div>
    </button>
  )
}
