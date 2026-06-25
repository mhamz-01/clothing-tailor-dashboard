"use client"

import { Plus } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TailorCombobox } from "./tailor-combobox"
import type { TailorRow, FormErrors, FormValues } from "@/types/assign-work"

interface OrderFormProps {
  tailors: TailorRow[]
  activeByTailor: Map<string, number>
  isLoadingTailors: boolean
  values: FormValues
  errors: FormErrors
  onTailorSelect: (tailorId: string) => void
  onCustomerRefChange: (value: string) => void
  onQuantityChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function OrderForm({
  tailors, activeByTailor, isLoadingTailors, values, errors,
  onTailorSelect, onCustomerRefChange, onQuantityChange, onSubmit,
}: OrderFormProps) {
  return (
    <div className="p-5 lg:col-span-2">
      <div className="mb-5 border-b pb-4">
        <h2 className="text-base font-semibold text-slate-900">Order Details</h2>
        <p className="mt-1 text-sm text-slate-500">Fill information to assign work</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Tailor
            {values.tailor_id && (
              <span onClick={() => onTailorSelect("")} className="ml-2 cursor-pointer text-xs font-normal text-indigo-500 hover:text-indigo-700">
                (change)
              </span>
            )}
          </Label>
          <TailorCombobox
            tailors={tailors}
            activeByTailor={activeByTailor}
            selectedTailorId={values.tailor_id}
            onSelect={onTailorSelect}
            disabled={isLoadingTailors || !!values.tailor_id}
            isLoading={isLoadingTailors}
          />
          {errors.tailor_id && <p className="text-xs text-red-500">{errors.tailor_id}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Customer ID</Label>
          <Input value={values.customer_ref_id} onChange={(e) => onCustomerRefChange(e.target.value)} placeholder="C001" className="h-10" />
          {errors.customer_ref_id && <p className="text-xs text-red-500">{errors.customer_ref_id}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Quantity</Label>
          <Input type="number" min={1} value={values.quantity} onChange={(e) => onQuantityChange(e.target.value)} className="h-10" />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
        </div>

        <Button type="submit" variant="default" disabled={isLoadingTailors} className="mt-12 h-10 w-full">
          <Plus className="mr-2 size-4" />Add Order
        </Button>
      </form>
    </div>
  )
}