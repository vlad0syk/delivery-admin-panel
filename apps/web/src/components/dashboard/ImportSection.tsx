'use client'

import { useRef, useState } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { importOrders, notifyOrdersUpdated } from "@/api"
import { showToast } from "@/toast"
import CsvImportProgressModal from "./CsvImportProgressModal"

type ImportModalState = {
  fileName: string
  progress: number
  activeStep: number
  isComplete: boolean
}

export default function ImportSection() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ImportModalState | null>(null)
  const [pendingResult, setPendingResult] = useState<ImportOrdersResult | null>(null)

  useEffect(() => {
    if (!modalState || modalState.isComplete) {
      return
    }

    const timer = window.setInterval(() => {
      setModalState((current) => {
        if (!current || current.isComplete) {
          return current
        }

        const nextProgress = Math.min(
          current.progress + (current.progress < 36 ? 7 : current.progress < 68 ? 4 : 2),
          92,
        )

        let nextStep = current.activeStep
        if (nextProgress >= 28) nextStep = 1
        if (nextProgress >= 56) nextStep = 2
        if (nextProgress >= 82) nextStep = 3

        return {
          ...current,
          progress: nextProgress,
          activeStep: nextStep,
        }
      })
    }, 180)

    return () => {
      window.clearInterval(timer)
    }
  }, [modalState?.isComplete])

  const openFileDialog = () => {
    if (isUploading) return
    inputRef.current?.click()
  }

  const isCsvFile = (fileToCheck: File) =>
    fileToCheck.type === "text/csv" || fileToCheck.name.toLowerCase().endsWith(".csv")

  const importFile = async (file: File) => {
    setIsUploading(true)
    setProgress(0)
    setError(null)
    setPendingResult(null)
    setModalState({
      fileName: file.name,
      progress: 12,
      activeStep: 0,
      isComplete: false,
    })

    // Simulate progress while uploading (actual upload is a single POST)
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const result = await importOrders(file)
      setProgress(100)
      showToast({
        title: "CSV imported successfully",
        message: `${result.imported} orders loaded | ${result.failed} errors`,
        variant: "import",
      })
      notifyOrdersUpdated()
    } catch (err) {
      setModalState(null)
      setError(err instanceof Error ? err.message : "Failed to import orders")
    } finally {
      window.clearInterval(interval)
      setIsUploading(false)
      // Reset progress after a brief delay so user sees 100%
      window.setTimeout(() => setProgress(0), 1200)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (isUploading) return
    if (!files || files.length === 0) return
    const first = files[0]
    if (!isCsvFile(first)) {
      setError("Please select a CSV file")
      return
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    setFileName(first.name)
    void importFile(first)
  }

  const progressPercent = Math.min(100, Math.round(progress))

  return (
    <button
      type="button"
      onClick={isUploading ? undefined : openFileDialog}
      disabled={isUploading}
      onDragOver={(event) => {
        event.preventDefault()
        if (!isUploading) setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        if (!isUploading) handleFiles(event.dataTransfer.files)
      }}
      className={`min-h-52.5 w-full rounded-xl border border-dashed px-4 py-5 text-left transition ${isUploading
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-80"
          : isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
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
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-hidden="true" />
        ) : (
          <ImagePlus className="h-8 w-8 text-gray-300" aria-hidden="true" />
        )}
        <span className="mt-3 inline-flex text-lg font-semibold text-blue-600">
          {isUploading ? "Importing..." : "Upload CSV file"}
        </span>

        {isUploading ? (
          <div className="mt-3 w-full max-w-48">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-[11px] font-semibold text-gray-400">
              or drag and drop
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
              CSV with latitude, longitude, subtotal
            </p>
          </>
        )}

        {fileName && !isUploading ? (
          <p className="mt-2 text-xs font-semibold text-gray-600">
            Selected: {fileName}
          </p>
          {fileName ? (
            <p className="mt-2 text-xs font-semibold text-gray-600">
              Selected: {fileName}
            </p>
          ) : null}
          {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
        </div>
      </button>

      <CsvImportProgressModal
        isOpen={modalState !== null}
        fileName={modalState?.fileName ?? ""}
        progress={modalState?.progress ?? 0}
        activeStep={modalState?.activeStep ?? 0}
        isComplete={modalState?.isComplete ?? false}
        onClose={handleCloseModal}
      />
    </>
  )
}
