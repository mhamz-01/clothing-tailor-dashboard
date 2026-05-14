export type Order = {
  id: string
  customer_ref_id: string
  tailor_id: string | null
  due_date: string
  status: 'assigned' | 'delivered'
  created_at: string
  delivered_at: string | null
  tailor?: {
    name: string
  }
  customer?: {
    name: string
  }
}
