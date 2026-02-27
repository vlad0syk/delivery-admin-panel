"use client"

import { useEffect, useMemo, useState } from "react"
import OrderRow from "./OrderRow"
import Pagination from "../ui/Pagination"

type OrderData = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
}

const baseOrders: OrderData[] = [
  {
    orderId: "#1247",
    locationLine1: "40.7580, -73.9855",
    locationLine2: "Manhattan, NY",
    subtotal: "$100.00",
    taxRate: "8.875%",
    taxAmount: "$8.88",
    total: "$108.88",
  },
  {
    orderId: "#1246",
    locationLine1: "40.6782, -73.9442",
    locationLine2: "Brooklyn, NY",
    subtotal: "$125.50",
    taxRate: "8.875%",
    taxAmount: "$11.14",
    total: "$136.64",
  },
  {
    orderId: "#1245",
    locationLine1: "40.7489, -73.9680",
    locationLine2: "Queens, NY",
    subtotal: "$89.99",
    taxRate: "8.875%",
    taxAmount: "$7.99",
    total: "$97.98",
  },
  {
    orderId: "#1244",
    locationLine1: "40.8448, -73.8648",
    locationLine2: "Bronx, NY",
    subtotal: "$150.00",
    taxRate: "8.875%",
    taxAmount: "$13.31",
    total: "$163.31",
  },
  {
    orderId: "#1243",
    locationLine1: "40.5795, -74.1502",
    locationLine2: "Staten Island, NY",
    subtotal: "$75.25",
    taxRate: "8.875%",
    taxAmount: "$6.68",
    total: "$81.93",
  },
]

const TOTAL_RESULTS = 1247
const PER_PAGE = 10
const TOTAL_PAGES = Math.ceil(TOTAL_RESULTS / PER_PAGE)
const HIGHEST_ORDER_ID = 1247

function useOrdersPagination(page: number) {
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * PER_PAGE
    const endIndex = Math.min(startIndex + PER_PAGE, TOTAL_RESULTS)
    const rows: OrderData[] = []

    for (let i = startIndex; i < endIndex; i++) {
      const template = baseOrders[i % baseOrders.length]
      const orderNumber = 1247 - i
      rows.push({
        ...template,
        orderId: `#${orderNumber}`,
      })
    }
    return rows
  }, [page])

  return { paginatedOrders }
}

export default function OrdersTable() {
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { paginatedOrders } = useOrdersPagination(page)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchValue])

  const normalizedSearch = debouncedSearch.trim().replace("#", "")
  const isSearching = normalizedSearch.length > 0
  const searchId = /^\d+$/.test(normalizedSearch)
    ? Number(normalizedSearch)
    : null

  const searchMatch = useMemo(() => {
    if (!isSearching || searchId === null) return null
    const index = HIGHEST_ORDER_ID - searchId
    if (index < 0 || index >= TOTAL_RESULTS) return null
    const template = baseOrders[index % baseOrders.length]
    return {
      ...template,
      orderId: `#${searchId}`,
    }
  }, [isSearching, searchId])

  const visibleOrders = isSearching ? (searchMatch ? [searchMatch] : []) : paginatedOrders
  const showPagination = !isSearching || !searchMatch

  const rangeText = useMemo(() => {
    if (!visibleOrders.length) return { topId: 0, bottomId: 0 }
    const topId = Number(visibleOrders[0].orderId.replace("#", ""))
    const bottomId = Number(
      visibleOrders[visibleOrders.length - 1].orderId.replace("#", "")
    )
    return { topId, bottomId }
  }, [visibleOrders])

  return (
    <section className="mx-auto mb-5 mt-6 w-full max-w-300 px-6">
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <input
              type="text"
              placeholder="Search orders..."
              aria-label="Search orders"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value)
                if (page !== 1) setPage(1)
              }}
              className="h-10 w-full rounded border border-gray-200 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none sm:w-64"
            />
            <select
              aria-label="Filter by jurisdiction"
              className="h-10 w-full rounded border border-gray-200 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none sm:w-44"
            >
              <option>All Jurisdictions</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-[1.1fr_2fr_repeat(4,minmax(0,1fr))_1.4fr] items-center border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
          <div>Order ID</div>
          <div>Location</div>
          <div>Subtotal</div>
          <div>Tax Rate</div>
          <div>Tax Amount</div>
          <div>Total</div>
          <div>Actions</div>
        </div>

        <div>
          {visibleOrders.map((order) => (
            <OrderRow key={order.orderId} {...order} />
          ))}
        </div>

        <div className="flex flex-col gap-2 rounded-b-xl border-t border-gray-200 bg-gray-100 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="whitespace-nowrap text-sm text-gray-600">
            Showing {rangeText.bottomId} to {rangeText.topId} of {TOTAL_RESULTS} results
          </p>
          {showPagination ? (
            <Pagination
              currentPage={page}
              totalPages={TOTAL_PAGES}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      <div className="h-4 w-full bg-gray-100" />
    </section>
  )
}
