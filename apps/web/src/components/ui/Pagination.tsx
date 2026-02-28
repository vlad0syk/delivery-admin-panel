"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps)
{
 if (totalPages < 1)
 {
   return null
 }
  const baseBtn =
    "flex h-9 min-w-9 items-center justify-center rounded border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:text-gray-300"

  const pages = (() => {
    const result: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i)
      return result
    }

    const addWindow = (start: number, end: number) => {
      for (let i = start; i <= end; i++) result.push(i)
    }

    const showLeftEllipsis = currentPage >= 4
    const showRightEllipsis = currentPage < totalPages - 3

    result.push(1)
    if (showLeftEllipsis) result.push("…")

    if (!showLeftEllipsis) {
      addWindow(2, 4)
    } else if (!showRightEllipsis) {
      addWindow(totalPages - 4, totalPages - 1)
    } else {
      addWindow(currentPage - 1, currentPage + 1)
    }

    if (showRightEllipsis) result.push("…")
    result.push(totalPages)

    return result
  })()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        className={baseBtn}
        type="button"
        disabled={currentPage === 1}
        aria-label="Previous page"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, idx) => {
        if (page === "…") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 min-w-9 items-center justify-center rounded border border-gray-200 bg-white px-3 text-sm text-gray-500"
            >
              …
            </span>
          )
        }

        const number = page as number
        const isActive = number === currentPage

        return (
          <button
            key={number}
            className={`${baseBtn} ${
              isActive ? "!border-blue-600 bg-blue-50 text-gray-700 ring-1 ring-blue-600" : ""
            }`}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        )
      })}

      <button
        className={baseBtn}
        type="button"
        disabled={currentPage === totalPages}
        aria-label="Next page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
