import { ClipboardList } from "lucide-react"
import { StagedOrdersTable } from "./staged-ordered-table"
import { StagedOrdersFooter } from "./staged-ordered-footer"
import type { StagedOrder } from "@/types/assign-work"

interface AssignTabPanelProps {
  stagedOrders: StagedOrder[]
  totalQuantity: number
  isSubmitting: boolean
  onRemove: (tempId: string) => void
  onSubmit: () => void
}

export function AssignTabPanel({ stagedOrders, totalQuantity, isSubmitting, onRemove, onSubmit }: AssignTabPanelProps) {
  return (
    <>
      <div className="overflow-y-auto p-5" style={{ height: "420px" }}>
        {stagedOrders.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-center">
            <ClipboardList className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No orders added</p>
            <p className="mt-1 text-xs text-slate-400">Fill the form and add orders to the list</p>
          </div>
        ) : (
          <StagedOrdersTable orders={stagedOrders} onRemove={onRemove} />
        )}
      </div>
      <StagedOrdersFooter orderCount={stagedOrders.length} totalQuantity={totalQuantity} isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  )
}