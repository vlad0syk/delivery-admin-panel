'use client'

import { useEffect } from "react"
import { Check, Circle, FileUp } from "lucide-react"

type CsvImportProgressModalProps = {
  isOpen: boolean
  fileName: string
  progress: number
  activeStep: number
  isComplete: boolean
  onClose: () => void
}

const STEPS = [
  "Reading CSV file",
  "Validating rows (latitude, longitude, subtotal)",
  "Importing orders into the system",
  "Refreshing dashboard statistics",
]

export default function CsvImportProgressModal({
  isOpen,
  fileName,
  progress,
  activeStep,
  isComplete,
  onClose,
}: CsvImportProgressModalProps) {
  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const title = isComplete ? "File uploaded successfully!" : "Uploading file..."
  const description = isComplete
    ? "The file has been processed. You can continue."
    : "The file is being processed. Please wait."
  const currentLabel = isComplete ? "Done!" : "Processing data..."
  const buttonLabel = isComplete ? "Done" : "Please wait..."

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-[#f7f9fc] px-6 py-7 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${
              isComplete
                ? "border-emerald-500 bg-emerald-100 text-emerald-600"
                : "border-blue-500 bg-blue-50 text-blue-600"
            }`}
          >
            {isComplete ? (
              <Check className="h-10 w-10" aria-hidden="true" />
            ) : (
              <FileUp className="h-10 w-10" aria-hidden="true" />
            )}
          </div>

          <h2
            className={`mt-6 text-3xl font-semibold leading-tight ${
              isComplete ? "text-emerald-600" : "text-slate-800"
            }`}
          >
            {title}
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-500">
            File <span className="font-semibold text-blue-600">{fileName}</span>
            {" "}
            {description}
          </p>
        </div>

        <div className="mt-7">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                isComplete ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm font-semibold">
            <span className={isComplete ? "text-emerald-600" : "text-slate-500"}>
              {currentLabel}
            </span>
            <span className={isComplete ? "text-emerald-600" : "text-blue-500"}>
              {progress}%
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {STEPS.map((step, index) => {
            const isDone = isComplete || index < activeStep
            const isCurrent = !isComplete && index === activeStep

            return (
              <div key={step} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-300 bg-white text-slate-300"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3 fill-current" aria-hidden="true" />
                  )}
                </div>

                <p
                  className={`text-base leading-6 ${
                    isDone
                      ? "text-emerald-600"
                      : isCurrent
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {step}
                </p>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={!isComplete}
          className={`mt-8 w-full rounded-2xl px-5 py-4 text-lg font-semibold transition-colors ${
            isComplete
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
