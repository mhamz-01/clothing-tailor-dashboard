import { createClient } from "@/lib/supabase/client"

export async function fetchTailors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tailors")
    .select("id, name")
    .order("name", { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function fetchActiveOrderCounts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("tailor_id")
    .eq("status", "assigned")
  if (error) throw new Error(error.message)

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    if (!row.tailor_id) continue
    counts.set(row.tailor_id, (counts.get(row.tailor_id) ?? 0) + 1)
  }
  return counts
}

export async function fetchAssignedOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`id, customer_ref_id, due_date, status, created_at, quantity, tailor:tailors(name)`)
    .eq("status", "assigned")
    .order("due_date", { ascending: true })
  if (error) throw new Error(error.message)

  return (data ?? []).map((row: any) => {
    let tailor: { name: string } | null = null
    if (Array.isArray(row.tailor)) tailor = row.tailor[0] ?? null
    else if (row.tailor && typeof row.tailor === "object") tailor = row.tailor
    return { ...row, tailor }
  })
}

export async function fetchDashboardStats() {
  const supabase = createClient()
  const now = new Date()

  function startOfDay(d: Date) {
    const c = new Date(d); c.setHours(0,0,0,0); return c
  }
  function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }

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

export async function fetchOrderHistory() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_ref_id,
      quantity,
      status,
      created_at,
      delivered_at,
      comment,
      tailor:tailors(name)
    `)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: any) => ({
    ...row,
    tailor: Array.isArray(row.tailor) ? row.tailor[0] ?? null : row.tailor,
  }))
}


export async function fetchAssignedOrdersWithTailors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`id, customer_ref_id, quantity, due_date, created_at, tailor_id, tailor:tailors(id, name)`)
    .eq("status", "assigned")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: any) => ({
    ...row,
    tailor: Array.isArray(row.tailor) ? row.tailor[0] ?? null : row.tailor,
  }))
}