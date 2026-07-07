import { createClient } from "@/lib/supabase/client"
import { startOfDay, startOfMonth } from "@/lib/utils/date"

export interface DashboardStats {
  totalOrdersToday: number
  totalOrdersMonthly: number
  pendingOrders: number
  deliveredToday: number
  deliveredMonthly: number
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()
  const now = new Date()

  const dayStart = startOfDay(now)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)
  const monthStart = startOfMonth(now)

  const [ordersToday, ordersMonthly, pendingOrders, deliveredToday, deliveredMonthly] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString()),
      supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()).lt("created_at", dayStart.toISOString()),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "assigned"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered").gte("delivered_at", dayStart.toISOString()).lt("delivered_at", dayEnd.toISOString()),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered").gte("delivered_at", monthStart.toISOString()).lt("delivered_at", dayStart.toISOString()),
    ])

  return {
    totalOrdersToday: ordersToday.count ?? 0,
    totalOrdersMonthly: ordersMonthly.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    deliveredToday: deliveredToday.count ?? 0,
    deliveredMonthly: deliveredMonthly.count ?? 0,
  }
}
