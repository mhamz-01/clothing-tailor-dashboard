import { memo } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { TailorCombobox } from "./tailor-combobox"
import { formatDueDate } from "@/lib/utils/date"
import type { AssignedOrder } from "@/types"
import type { TailorRow } from "@/types/assign-work"

interface ManageAssignedRowProps {
  order: AssignedOrder
  tailors: TailorRow[]
  activeByTailor: Map<string, number>
  isEditing: boolean
  editTailorId: string
  isSaving: boolean
  onStartEdit: (orderId: string, currentTailorId: string) => void
  onCancelEdit: () => void
  onEditTailorSelect: (tailorId: string) => void
  onSave: (orderId: string) => void
}

function ManageAssignedRowComponent({
  order, tailors, activeByTailor, isEditing, editTailorId, isSaving,
  onStartEdit, onCancelEdit, onEditTailorSelect, onSave,
}: ManageAssignedRowProps) {
  return (
    <TableRow className="border-b hover:bg-slate-50">
      <TableCell className="px-4 py-3 font-medium text-slate-800">{order.customer_ref_id}</TableCell>
      <TableCell className="px-4 py-3 text-slate-600">
        {isEditing ? (
          <TailorCombobox tailors={tailors} activeByTailor={activeByTailor} selectedTailorId={editTailorId} onSelect={onEditTailorSelect} size="sm" />
        ) : (
          <span>{order.tailor?.name ?? "—"}</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-slate-600">{order.quantity ?? "—"}</TableCell>
      <TableCell className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDueDate(order.due_date)}</TableCell>
      <TableCell className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button size="sm" className="h-7 px-3 text-xs" disabled={!editTailorId || isSaving} onClick={() => onSave(order.id)}>
                {isSaving ? <Loader2 className="size-3 animate-spin" /> : "Save"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs" onClick={onCancelEdit}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => onStartEdit(order.id, order.tailor_id ?? "")}>
              Change Tailor
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export const ManageAssignedRow = memo(ManageAssignedRowComponent)