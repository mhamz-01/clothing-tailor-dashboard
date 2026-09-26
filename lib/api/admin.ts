// Browser-side client for the /api/admin/* routes. Admin-module tables
// (tailors, orders) have RLS enabled with no anon policies, so the browser
// can't query Supabase directly — every read/write goes through these
// session-checked route handlers, which use the service-role key.
import { startOfDay, startOfMonth } from "@/lib/utils/date"
import type { DashboardStats } from "@/lib/queries/dashboard"
import type { InsertTailorInput } from "@/lib/queries/tailors"
import type { AssignedOrder, Order } from "@/types"
import type { DeliverableOrder, StagedDelivery } from "@/types/deliver-work"
import type { StagedOrder, TailorRow } from "@/types/assign-work"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init?.body ? { ...init, headers: { "Content-Type": "application/json" } } : init)
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? "Request failed.")
  return body
}

function send<T>(url: string, method: string, data?: unknown) {
  return request<T>(url, { method, body: data === undefined ? undefined : JSON.stringify(data) })
}

export async function fetchTailors(): Promise<TailorRow[]> {
  return (await request<{ tailors: TailorRow[] }>("/api/admin/tailors")).tailors
}

export async function insertTailor(values: InsertTailorInput) {
  await send("/api/admin/tailors", "POST", values)
}

export async function deleteTailor(id: string) {
  await send(`/api/admin/tailors/${id}`, "DELETE")
}

export async function fetchActiveOrderCounts(): Promise<Map<string, number>> {
  const { counts } = await request<{ counts: Record<string, number> }>("/api/admin/orders/active-counts")
  return new Map(Object.entries(counts))
}

export async function fetchAssignedOrders(): Promise<DeliverableOrder[]> {
  return (await request<{ orders: DeliverableOrder[] }>("/api/admin/orders/assigned")).orders
}

export async function fetchAssignedOrdersWithTailors(): Promise<AssignedOrder[]> {
  return (await request<{ orders: AssignedOrder[] }>("/api/admin/orders/assigned-with-tailors")).orders
}

export async function fetchOrderHistory(): Promise<Order[]> {
  return (await request<{ orders: Order[] }>("/api/admin/orders")).orders
}

export async function insertOrders(orders: StagedOrder[]) {
  await send("/api/admin/orders", "POST", { orders })
}

export async function updateOrderTailor(orderId: string, tailorId: string) {
  await send(`/api/admin/orders/${orderId}`, "PATCH", { tailorId })
}

export async function deliverOrders(deliveries: StagedDelivery[]) {
  await send("/api/admin/orders/deliver", "POST", { deliveries })
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const params = new URLSearchParams({
    dayStart: dayStart.toISOString(),
    dayEnd: dayEnd.toISOString(),
    monthStart: startOfMonth(now).toISOString(),
  })
  return request<DashboardStats>(`/api/admin/dashboard?${params}`)
}
