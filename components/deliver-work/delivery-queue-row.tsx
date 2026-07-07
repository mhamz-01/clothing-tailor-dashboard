import { memo } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import type { StagedDelivery } from "@/types/deliver-work";
function DeliveryQueueRowComponent({ delivery, onRemove }: { delivery: StagedDelivery; onRemove: (id: string) => void }) {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="border border-gray-200 px-2 py-2 font-semibold text-gray-900">{delivery.tailor_name}</TableCell>
      <TableCell className="border border-gray-200 px-2 py-2 text-gray-600">{delivery.customer_ref_id}</TableCell>
      <TableCell className="border border-gray-200 px-2 py-2 text-gray-600">{delivery.quantity ?? "—"}</TableCell>
      <TableCell className="border border-gray-200 px-2 py-2 text-gray-500 italic whitespace-normal">{delivery.comment || "—"}</TableCell>
      <TableCell className="border border-gray-200 px-2 py-2 text-center">
        <button type="button" onClick={() => onRemove(delivery.id)} className="text-gray-300 transition hover:text-red-500">✕</button>
      </TableCell>
    </TableRow>
  )
}

export const DeliveryQueueRow = memo(DeliveryQueueRowComponent)