export type Order = {
  id: string
  customer_ref_id: string
  tailor_id: string | null
  due_date: string
  status: 'assigned' | 'delivered'
  quantity: number | null
  created_at: string
  comment: string | null
  delivered_at: string | null
  tailor?: {
    name: string
  }
  customer?: {
    name: string
  }
}