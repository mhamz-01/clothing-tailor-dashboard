import { createClient } from "@/lib/supabase/client"
import { normalizeTailorJoin } from "./shared"
import type { AssignedOrder } from "@/types"
import type { DeliverableOrder, StagedDelivery } from "@/types/deliver-work"
import type { StagedOrder } from "@/types/assign-work"

export async function fetchActiveOrderCounts(): Promise<Map<string, number>> {
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

export async function fetchAssignedOrders(): Promise<DeliverableOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`id, customer_ref_id, due_date, status, created_at, quantity, tailor:tailors(name)`)
    .eq("status", "assigned")
    .order("due_date", { ascending: true })
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => normalizeTailorJoin<typeof row, { name: string }>(row))
}

export async function fetchAssignedOrdersWithTailors(): Promise<AssignedOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`id, customer_ref_id, quantity, due_date, created_at, tailor_id, tailor:tailors(id, name)`)
    .eq("status", "assigned")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => normalizeTailorJoin<typeof row, { id: string; name: string }>(row))
}

export async function insertOrders(orders: StagedOrder[]) {
  const supabase = createClient()
  const { error } = await supabase.from("orders").insert(
    orders.map((o) => ({
      customer_ref_id: o.customer_ref_id,
      tailor_id: o.tailor_id,
      quantity: o.quantity,
      due_date: o.due_date,
      status: "assigned",
      delivered_at: null,
    }))
  )
  if (error) throw new Error(error.message)
}

export async function updateOrderTailor(orderId: string, tailorId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("orders").update({ tailor_id: tailorId }).eq("id", orderId)
  if (error) throw new Error(error.message)
}

export async function deleteOrder(orderId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("orders").delete().eq("id", orderId)
  if (error) throw new Error(error.message)
}

export async function deliverOrders(deliveries: StagedDelivery[]) {
  const supabase = createClient()
  const results = await Promise.all(
    deliveries.map((d) =>
      supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
          comment: d.comment.trim() || null,
        })
        .eq("id", d.id)
    )
  )

  const failed = results.filter((r) => r.error)
  if (failed.length > 0) throw new Error("Some orders failed to update. Please try again.")
}
