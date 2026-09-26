import { createServiceRoleClient } from "@/lib/supabase/service"

export interface DashboardStats {
  totalOrdersToday: number
  totalOrdersMonthly: number
  pendingOrders: number
  deliveredToday: number
  deliveredMonthly: number
}

// ISO timestamps computed in the browser, so "today"/"this month" follow the
// shop's local timezone rather than the server's (UTC on Vercel).
export interface DashboardRange {
  dayStart: string
  dayEnd: string
  monthStart: string
}

export async function fetchDashboardStats({ dayStart, dayEnd, monthStart }: DashboardRange): Promise<DashboardStats> {
  const supabase = createServiceRoleClient()

  const [ordersToday, ordersMonthly, pendingOrders, deliveredToday, deliveredMonthly] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", dayStart).lt("created_at", dayEnd),
      supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart).lt("created_at", dayStart),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "assigned"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered").gte("delivered_at", dayStart).lt("delivered_at", dayEnd),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered").gte("delivered_at", monthStart).lt("delivered_at", dayStart),
    ])

  const failed = [ordersToday, ordersMonthly, pendingOrders, deliveredToday, deliveredMonthly].find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)

  return {
    totalOrdersToday: ordersToday.count ?? 0,
    totalOrdersMonthly: ordersMonthly.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    deliveredToday: deliveredToday.count ?? 0,
    deliveredMonthly: deliveredMonthly.count ?? 0,
  }
}
