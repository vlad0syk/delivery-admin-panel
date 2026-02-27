"use client"

import { useEffect, useMemo, useState } from "react"
import OrderRow from "./OrderRow"
import Pagination from "../ui/Pagination"
import MobileOrderCard from "./MobileOrderCard"
import Modal from "../ui/Modal"
import { fetchOrders, ORDERS_UPDATED_EVENT } from "@/api"

type OrderData = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
}

const PER_PAGE = 20

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(num)) return "$0.00"
  return `$${num.toFixed(2)}`
}

function formatTaxRate(rate: number) {
  const percent = rate * 100
  return `${percent.toFixed(3)}%`
}

export default function OrdersTable() {
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [orders, setOrders] = useState<OrderData[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    const handleUpdated = () => {
      setRefreshToken((value) => value + 1)
    }

    window.addEventListener(ORDERS_UPDATED_EVENT, handleUpdated)
    return () => window.removeEventListener(ORDERS_UPDATED_EVENT, handleUpdated)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchOrders({
          page,
          limit: PER_PAGE,
          id: debouncedSearch.trim() || undefined,
        })

        setTotalResults(response.pagination.total)
        setTotalPages(response.pagination.totalPages)

        const mapped: OrderData[] = response.data.map((order) => {
          const coords = `${order.location.latitude.toFixed(4)}, ${order.location.longitude.toFixed(4)}`
          return {
            orderId: order.id,
            locationLine1: coords,
            locationLine2: order.location.taxRateRegion.name,
            subtotal: formatMoney(order.subtotal),
            taxRate: formatTaxRate(order.location.taxRateRegion.composite_rate),
            taxAmount: formatMoney(order.tax_amount),
            total: formatMoney(order.total_amount),
          }
        })

        setOrders(mapped)

        if (page > response.pagination.totalPages) {
          setPage(response.pagination.totalPages || 1)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      controller.abort()
    }
  }, [page, debouncedSearch, refreshToken])

  const rangeText = useMemo(() => {
    if (!orders.length) {
      return { topIndex: 0, bottomIndex: 0 }
    }

    const start = (page - 1) * PER_PAGE + 1
    const end = start + orders.length - 1
    return { topIndex: end, bottomIndex: start }
  }, [orders.length, page])

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

        <div className="space-y-3 p-4 md:hidden">
          {orders.map((order) => (
            <MobileOrderCard key={order.orderId} {...order} onViewDetails={() => setSelectedOrder(order)} />
          ))}
        </div>

        <div className="hidden md:block">
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
            {orders.map((order) => (
              <OrderRow key={order.orderId} {...order} onViewDetails={() => setSelectedOrder(order)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-b-xl border-t border-gray-200 bg-gray-100 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="whitespace-nowrap text-sm text-gray-600">
            {isLoading
              ? "Loading orders..."
              : `Showing ${rangeText.bottomIndex} to ${rangeText.topIndex} of ${totalResults} results`}
          </p>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          {totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      <div className="h-4 w-full bg-gray-100" />

      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder ? (
          <div className="space-y-4 text-gray-900 sm:space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
                {selectedOrder.orderId}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1.5 text-base font-medium tracking-tight text-gray-950 sm:text-lg">
                {selectedOrder.locationLine1}
              </p>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">{selectedOrder.locationLine2}</p>
            </div>

            <div className="grid gap-3 border-b border-gray-200 pb-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Jurisdiction</p>
                <p className="mt-1.5 text-base font-medium tracking-tight text-gray-950 sm:text-lg">
                  New York County
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1.5 text-base font-medium tracking-tight text-gray-950 sm:text-lg">
                  February 27, 2026
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium tracking-tight text-gray-950">
                Financial Summary
              </h3>

              <div className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Subtotal</p>
                  <p className="mt-1.5 text-lg font-medium tracking-tight text-gray-950 sm:text-xl">
                    {selectedOrder.subtotal}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tax Rate</p>
                  <p className="mt-1.5 text-lg font-medium tracking-tight text-gray-950 sm:text-xl">
                    {selectedOrder.taxRate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tax Amount</p>
                  <p className="mt-1.5 text-lg font-medium tracking-tight text-gray-950 sm:text-xl">
                    {selectedOrder.taxAmount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="mt-1.5 text-lg font-medium tracking-tight text-gray-950 sm:text-xl">
                    {selectedOrder.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}