export type StatusFilter = "all" | "assigned" | "delivered"

export type Order = {
  id: string
  customer_ref_id: string
  status: 'assigned' | 'delivered'
  quantity: number | null
  created_at: string
  comment: string | null
  delivered_at: string | null
  tailor: {
    name: string
  } | null
}
