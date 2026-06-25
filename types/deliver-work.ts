export interface DeliverableOrder {
    id: string
    customer_ref_id: string
    status: string
    created_at: string
    quantity: number | null
    tailor: { name: string } | null
  }
  
  export interface StagedDelivery {
    id: string
    customer_ref_id: string
    tailor_name: string
    quantity: number | null
    comment: string
  }