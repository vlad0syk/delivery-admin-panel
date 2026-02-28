"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Trash2 } from "lucide-react"
import OrderRow from "./OrderRow"
import Pagination from "../ui/Pagination"
import MobileOrderCard from "./MobileOrderCard"
import Modal from "../ui/Modal"
import ConfirmDialog from "../ui/ConfirmDialog"
import EditOrderModal from "./EditOrderModal"
import FiltersPanel from "./FiltersPanel"
import type { FilterValues } from "./FiltersPanel"
import {
  fetchOrders,
  deleteOrder as apiDeleteOrder,
  deleteAllOrders as apiDeleteAllOrders,
  deleteOrdersBatch,
  notifyOrdersUpdated,
  ORDERS_UPDATED_EVENT,
} from "@/api"
import type { Jurisdiction } from "@/api"
import { showToast } from "@/toast"

type OrderData = {
  orderId: string
  locationLine1: string
  locationLine2: string
  subtotal: string
  rawSubtotal: string
  taxRate: string
  taxAmount: string
  total: string
  timestamp: string
  jurisdictions: Jurisdiction[]
}

const PER_PAGE = 5

const EMPTY_FILTERS: FilterValues = {
  dateFrom: "",
  dateTo: "",
  minSubtotal: "",
  maxSubtotal: "",
  minTaxAmount: "",
  maxTaxAmount: "",
  specialRate: "",
}

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(num)) return "$0.00"
  return `$${num.toFixed(2)}`
}

function formatTaxRate(rate: number) {
  const percent = rate * 100
  return `${percent.toFixed(3)}%`
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

type SortField = "subtotal" | "tax_amount" | "total_amount" | "timestamp"

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

  // Jurisdiction filter
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("")
  const [jurisdictions, setJurisdictions] = useState<string[]>([])

  // Filters
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>("timestamp")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // View details modal
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)

  // Delete single order
  const [deleteTarget, setDeleteTarget] = useState<OrderData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Delete all orders
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  // Edit order
  const [editTarget, setEditTarget] = useState<OrderData | null>(null)

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteSelected, setShowDeleteSelected] = useState(false)
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchValue])

  // Listen for external updates
  useEffect(() => {
    const handleUpdated = () => {
      setRefreshToken((value) => value + 1)
    }

    window.addEventListener(ORDERS_UPDATED_EVENT, handleUpdated)
    return () => window.removeEventListener(ORDERS_UPDATED_EVENT, handleUpdated)
  }, [])

  // Fetch orders
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
          taxRateRegionName: selectedJurisdiction || undefined,
          dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
          dateTo: filters.dateTo ? new Date(filters.dateTo + "T23:59:59").toISOString() : undefined,
          minSubtotal: filters.minSubtotal || undefined,
          maxSubtotal: filters.maxSubtotal || undefined,
          minTaxAmount: filters.minTaxAmount || undefined,
          maxTaxAmount: filters.maxTaxAmount || undefined,
          specialRate: filters.specialRate || undefined,
          sortBy,
          sortOrder,
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
            rawSubtotal: String(order.subtotal),
            taxRate: formatTaxRate(order.location.taxRateRegion.composite_rate),
            taxAmount: formatMoney(order.tax_amount),
            total: formatMoney(order.total_amount),
            timestamp: formatTimestamp(order.timestamp),
            jurisdictions: order.location.taxRateRegion.jurisdictions ?? [],
          }
        })

        setOrders(mapped)

        // Collect unique jurisdiction names
        const names = new Set(response.data.map((o) => o.location.taxRateRegion.name))
        setJurisdictions((prev) => {
          const merged = new Set([...prev, ...names])
          return [...merged].sort()
        })

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
  }, [page, debouncedSearch, selectedJurisdiction, filters, sortBy, sortOrder, refreshToken])

  // Clear selection when orders change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [orders])

  // Handlers
  const handleDeleteOne = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const deletedOrderId = deleteTarget.orderId
      await apiDeleteOrder(deleteTarget.orderId)
      showToast({ title: "Order deleted", message: `Order ${deleteTarget.orderId} was deleted` })
      notifyOrdersUpdated()
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order")
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    setIsDeletingAll(true)
    try {
      const deletedCount = totalResults
      await apiDeleteAllOrders()
      showToast({ title: "All orders deleted", message: `${totalResults} orders were deleted` })
      notifyOrdersUpdated()
      setShowDeleteAll(false)
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete orders")
      setShowDeleteAll(false)
    } finally {
      setIsDeletingAll(false)
    }
  }

  const handleDeleteSelected = async () => {
    const count = selectedIds.size
    setIsDeletingSelected(true)
    try {
      await deleteOrdersBatch([...selectedIds])
      showToast({ title: "Orders deleted", message: `${count} selected orders were deleted` })
      notifyOrdersUpdated()
      setShowDeleteSelected(false)
      setSelectedIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete selected orders")
      setShowDeleteSelected(false)
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.orderId)))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const handleFiltersChange = (next: FilterValues) => {
    setFilters(next)
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown size={13} className="text-gray-400" />
    return sortOrder === "asc"
      ? <ArrowUp size={13} className="text-blue-600" />
      : <ArrowDown size={13} className="text-blue-600" />
  }

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
              placeholder="Search by ID..."
              aria-label="Search orders"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value)
              }}
              className="h-10 w-full rounded border border-gray-200 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none sm:w-56"
            />
            <div className="relative w-full sm:w-48">
              <select
                aria-label="Filter by jurisdiction"
                value={selectedJurisdiction}
                onChange={(e) => {
                  setSelectedJurisdiction(e.target.value)
                  setPage(1)
                }}
                className="h-10 w-full appearance-none rounded border border-gray-200 px-3 pr-9 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Jurisdictions</option>
                {jurisdictions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {selectedIds.size > 0 ? (
              <button
                type="button"
                onClick={() => setShowDeleteSelected(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 sm:w-auto"
                title={`Delete ${selectedIds.size} selected`}
              >
                <Trash2 size={15} />
                <span>Delete ({selectedIds.size})</span>
              </button>
            ) : totalResults > 0 ? (
              <button
                type="button"
                onClick={() => setShowDeleteAll(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 sm:w-auto"
                title="Delete all orders"
              >
                <Trash2 size={15} />
                <span className="sm:hidden lg:inline">Delete All</span>
              </button>
            ) : null}
          </div>
        </div>

        <FiltersPanel values={filters} onChange={handleFiltersChange} />

        <div className="space-y-3 p-4 md:hidden">
          {orders.map((order) => (
            <MobileOrderCard
              key={order.orderId}
              {...order}
              isSelected={selectedIds.has(order.orderId)}
              onToggleSelect={() => toggleSelectOne(order.orderId)}
              onViewDetails={() => setSelectedOrder(order)}
              onEdit={() => setEditTarget(order)}
              onDelete={() => setDeleteTarget(order)}
            />
          ))}
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-[auto_1.1fr_1.6fr_repeat(4,minmax(0,1fr))_0.9fr_1.2fr] items-center gap-x-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-5">
            <div className="pr-3">
              <input
                type="checkbox"
                checked={orders.length > 0 && selectedIds.size === orders.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div>Order ID</div>
            <div>Location</div>
            <button type="button" onClick={() => handleSort("subtotal")} className="relative z-10 flex cursor-pointer items-center gap-1 text-left hover:text-gray-700">
              Subtotal <SortIcon field="subtotal" />
            </button>
            <div>Tax Rate</div>
            <button type="button" onClick={() => handleSort("tax_amount")} className="relative z-10 flex cursor-pointer items-center gap-1 text-left hover:text-gray-700">
              Tax Amount <SortIcon field="tax_amount" />
            </button>
            <button type="button" onClick={() => handleSort("total_amount")} className="relative z-10 flex cursor-pointer items-center gap-1 text-left hover:text-gray-700">
              Total <SortIcon field="total_amount" />
            </button>
            <button type="button" onClick={() => handleSort("timestamp")} className="relative z-10 flex cursor-pointer items-center gap-1 text-left hover:text-gray-700">
              Date <SortIcon field="timestamp" />
            </button>
            <div className="text-right">Actions</div>
          </div>

          <div>
            {orders.map((order) => (
              <OrderRow
                key={order.orderId}
                {...order}
                isSelected={selectedIds.has(order.orderId)}
                onToggleSelect={() => toggleSelectOne(order.orderId)}
                onViewDetails={() => setSelectedOrder(order)}
                onEdit={() => setEditTarget(order)}
                onDelete={() => setDeleteTarget(order)}
              />
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

            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="mt-1.5 text-base font-medium tracking-tight text-gray-950 sm:text-lg">
                {selectedOrder.timestamp}
              </p>
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

            {selectedOrder.jurisdictions.length > 0 ? (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium tracking-tight text-gray-950">
                  Tax Breakdown
                </h3>
                <div className="mt-3 space-y-2">
                  {selectedOrder.jurisdictions.map((j) => (
                    <div
                      key={j.id}
                      className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${j.type === "state"
                            ? "bg-blue-100 text-blue-700"
                            : j.type === "county"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {j.type}
                        </span>
                        <span className="min-w-0 break-words text-sm font-medium text-gray-800">
                          {j.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        {(j.rate * 100).toFixed(3)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Order"
        message={`Are you sure you want to delete order ${deleteTarget?.orderId ?? ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteOne}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={showDeleteAll}
        title="Delete All Orders"
        message={`Are you sure you want to delete all ${totalResults} orders? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        isLoading={isDeletingAll}
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAll(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteSelected}
        title="Delete Selected Orders"
        message={`Are you sure you want to delete ${selectedIds.size} selected orders? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size}`}
        variant="danger"
        isLoading={isDeletingSelected}
        onConfirm={handleDeleteSelected}
        onCancel={() => setShowDeleteSelected(false)}
      />

      <EditOrderModal
        isOpen={editTarget !== null}
        orderId={editTarget?.orderId ?? ""}
        initialLatitude={editTarget?.locationLine1.split(",")[0]?.trim() ?? ""}
        initialLongitude={editTarget?.locationLine1.split(",")[1]?.trim() ?? ""}
        initialSubtotal={editTarget?.rawSubtotal ?? ""}
        onClose={() => setEditTarget(null)}
      />
    </section>
  )
}
