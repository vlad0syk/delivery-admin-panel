const envUrl = import.meta.env.VITE_API_URL;
const API_BASE = envUrl
  ? envUrl.replace(/\/$/, '')
  : '/api';
console.log("Resolved API_BASE:", API_BASE);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = new Headers({
    ...(init?.headers ?? new Headers()),
  });

  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (typeof data?.message === "string") {
        message = data.message
      }
    } catch {
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export interface Jurisdiction {
  id: string
  name: string
  type: string
  rate: number
}

export interface TaxRateRegion {
  id: string
  name: string
  composite_rate: number
  jurisdictions: Jurisdiction[]
}

export interface Location {
  id: string
  latitude: number
  longitude: number
  taxRateRegion: TaxRateRegion
}

export interface Order {
  id: string
  subtotal: string | number
  total_amount: string | number
  tax_amount: string | number
  timestamp: string
  location: Location
}

export interface OrdersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OrdersResponse {
  data: Order[]
  pagination: OrdersPagination
}

export interface FetchOrdersParams {
  page?: number
  limit?: number
  id?: string
  taxRateRegionName?: string
  dateFrom?: string
  dateTo?: string
  minSubtotal?: string
  maxSubtotal?: string
  minTaxAmount?: string
  maxTaxAmount?: string
  specialRate?: string
  sortBy?: string
  sortOrder?: string
}

export async function fetchOrders(params: FetchOrdersParams) {
  const search = new URLSearchParams()

  const entries: [string, string | undefined][] = [
    ["page", params.page != null ? String(params.page) : undefined],
    ["limit", params.limit != null ? String(params.limit) : undefined],
    ["id", params.id || undefined],
    ["taxRateRegionName", params.taxRateRegionName || undefined],
    ["dateFrom", params.dateFrom || undefined],
    ["dateTo", params.dateTo || undefined],
    ["minSubtotal", params.minSubtotal || undefined],
    ["maxSubtotal", params.maxSubtotal || undefined],
    ["minTaxAmount", params.minTaxAmount || undefined],
    ["maxTaxAmount", params.maxTaxAmount || undefined],
    ["specialRate", params.specialRate || undefined],
    ["sortBy", params.sortBy || undefined],
    ["sortOrder", params.sortOrder || undefined],
  ]

  for (const [key, value] of entries) {
    if (value) search.set(key, value)
  }

  const query = search.toString()
  const path = `/orders${query ? `?${query}` : ""}`

  return request<OrdersResponse>(path)
}

export async function createOrder(payload: { latitude: string; longitude: string; subtotal: string }) {
  const normalizeNumber = (value: string) => Number(value.replace(",", "."))

  const body = {
    latitude: normalizeNumber(payload.latitude),
    longitude: normalizeNumber(payload.longitude),
    subtotal: normalizeNumber(payload.subtotal),
    timestamp: new Date().toISOString(),
  }

  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export interface ImportOrdersResult {
  processed: number
  imported: number
  failed: number
  errors: { line: number; id?: string; message: string }[]
}

export async function importOrders(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return request<ImportOrdersResult>("/orders/import", {
    method: "POST",
    body: formData,
  })
}

export async function deleteOrder(id: string) {
  return request<void>(`/orders/${id}`, { method: "DELETE" })
}

export async function deleteAllOrders() {
  return request<void>("/orders", { method: "DELETE" })
}

export async function deleteOrdersBatch(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map((id) => deleteOrder(id))
  )
  const failed = results.filter((r) => r.status === "rejected").length
  if (failed > 0) {
    throw new Error(`Failed to delete ${failed} of ${ids.length} orders`)
  }
}

export interface UpdateOrderPayload {
  latitude?: number
  longitude?: number
  subtotal?: number
  timestamp?: string
}

export async function updateOrder(id: string, payload: UpdateOrderPayload) {
  return request<Order>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export interface OrdersStats {
  totalOrders: number
  totalTaxCollected: number
  avgTaxRate: number
  lastOrderTime: string | null
}

export async function fetchStats() {
  return request<OrdersStats>("/orders/stats")
}

export const ORDERS_UPDATED_EVENT = "orders:updated"

export function notifyOrdersUpdated() {
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT))
};