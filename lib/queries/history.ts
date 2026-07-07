import { createClient } from "@/lib/supabase/client"
import { normalizeTailorJoin } from "./shared"
import type { Order } from "@/types"

export async function fetchOrderHistory(): Promise<Order[]> {
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

  return (data ?? []).map((row) => normalizeTailorJoin<typeof row, { name: string }>(row))
}
