'use client'

import { useEffect, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"
import { importOrders, notifyOrdersUpdated, type ImportOrdersResult } from "@/api"
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
    setError(null)
    setPendingResult(null)
    setModalState({
      fileName: file.name,
      progress: 12,
      activeStep: 0,
      isComplete: false,
    })

    try {
      const result = await importOrders(file)
      setPendingResult(result)
      setModalState((current) =>
        current
          ? {
              ...current,
              progress: 100,
              activeStep: 3,
              isComplete: true,
            }
          : null,
      )
      notifyOrdersUpdated()
    } catch (err) {
      setModalState(null)
      setError(err instanceof Error ? err.message : "Failed to import orders")
    } finally {
      setIsUploading(false)
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

  const handleCloseModal = () => {
    if (!modalState?.isComplete) {
      return
    }

    if (pendingResult) {
      showToast({
        title: "CSV imported successfully",
        message: `${pendingResult.imported} orders loaded | ${pendingResult.failed} errors`,
        variant: "import",
      })
    }

    setPendingResult(null)
    setModalState(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={openFileDialog}
        onDragOver={(event) => {
          event.preventDefault()
          if (!isUploading) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        disabled={isUploading}
        className={`min-h-52.5 w-full rounded-xl border border-dashed px-4 py-5 text-left transition ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        } ${isUploading ? "cursor-not-allowed opacity-80" : ""}`}
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
