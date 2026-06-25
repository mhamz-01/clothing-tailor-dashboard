export interface TailorRow {
    id: string
    name: string
  }
  
  export interface StagedOrder {
    tempId: string
    tailor_id: string
    tailor_name: string
    customer_ref_id: string
    quantity: number
    due_date: string
  }
  
  export interface FormValues {
    tailor_id: string
    customer_ref_id: string
    quantity: string
  }
  
  export type FormErrors = Partial<Record<keyof FormValues, string>>