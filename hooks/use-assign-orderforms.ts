"use client"

import { useState, type FormEvent } from "react"
import { toast } from "@/hooks/use-toast"
import { validateOrderForm } from "@/lib/validation/order-form"
import { todayDateInputValue } from "@/lib/utils/date"
import { MAX_ACTIVE_ORDERS_PER_TAILOR } from "@/lib/constants/orders"
import { FormValues, FormErrors, TailorRow, StagedOrder } from "@/types/assign-work"

const initialValues: FormValues = { tailor_id: "", customer_ref_id: "", quantity: "1" }

interface UseAssignOrderFormArgs {
  tailors: TailorRow[]
  activeByTailor: Map<string, number>
  countStagedForTailor: (tailorId: string) => number
  onAdd: (order: StagedOrder) => void
}

export function useAssignOrderForm({ tailors, activeByTailor, countStagedForTailor, onAdd }: UseAssignOrderFormArgs) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  function setTailorId(tailorId: string) {
    setValues((prev) => ({ ...prev, tailor_id: tailorId }))
    setErrors((prev) => ({ ...prev, tailor_id: undefined }))
  }

  function setCustomerRef(value: string) {
    setValues((prev) => ({ ...prev, customer_ref_id: value }))
  }

  function setQuantity(value: string) {
    setValues((prev) => ({ ...prev, quantity: value }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validateOrderForm(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const tailor = tailors.find((t) => t.id === values.tailor_id)
    if (!tailor) return

    const alreadyActive = activeByTailor.get(values.tailor_id) ?? 0
    const alreadyStaged = countStagedForTailor(values.tailor_id)
    if (alreadyActive + alreadyStaged >= MAX_ACTIVE_ORDERS_PER_TAILOR) {
      toast({ title: "Limit reached", description: `${tailor.name} already has ${MAX_ACTIVE_ORDERS_PER_TAILOR} active orders.`, variant: "destructive" })
      return
    }

    onAdd({
      tempId: crypto.randomUUID(),
      tailor_id: values.tailor_id,
      tailor_name: tailor.name,
      customer_ref_id: values.customer_ref_id.trim(),
      quantity: parseInt(values.quantity, 10),
      due_date: todayDateInputValue(),
    })

    setValues((prev) => ({ ...prev, customer_ref_id: "", quantity: "1" }))
    setErrors({})
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, setTailorId, setCustomerRef, setQuantity, handleSubmit, reset }
}