async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = new Headers({
    ...(init?.headers ?? new Headers()),
  });

  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`/api${path}`, {
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

export interface TaxRateRegion {
  id: string
  name: string
  composite_rate: number
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

export async function fetchOrders(params: { page?: number; limit?: number; id?: string }) {
  const search = new URLSearchParams()
  if (params.page != null) search.set("page", String(params.page))
  if (params.limit != null) search.set("limit", String(params.limit))
  if (params.id) search.set("id", params.id)

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