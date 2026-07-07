export type Tailor = {
  id: string
  tailor_ref_id: string
  name: string
  phone: string
  skills: string | null
  created_at: string
}

export interface AssignedOrder {
  id: string
  customer_ref_id: string
  tailor_id: string | null
  tailor: Pick<Tailor, "id" | "name"> | null
  quantity: number | null
  due_date: string | null
}