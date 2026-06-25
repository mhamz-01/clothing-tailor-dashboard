import type { FormErrors, FormValues } from "@/types/assign-work"

export function validateOrderForm(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.tailor_id.trim()) errors.tailor_id = "Please select a tailor."
  if (!values.customer_ref_id.trim()) errors.customer_ref_id = "Customer ID is required."

  const qty = parseInt(values.quantity, 10)
  if (!values.quantity || isNaN(qty) || qty < 1) errors.quantity = "Quantity must be at least 1."

  return errors
}