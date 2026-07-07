import type { InsertTailorInput } from "@/lib/queries/tailors"

export type TailorFormErrors = Partial<Record<keyof InsertTailorInput, string>>

export function validateTailorForm(values: InsertTailorInput): TailorFormErrors {
  const errors: TailorFormErrors = {}
  if (!values.name.trim()) errors.name = "Tailor name is required."
  if (!values.phone.trim()) errors.phone = "Phone number is required."
  return errors
}
