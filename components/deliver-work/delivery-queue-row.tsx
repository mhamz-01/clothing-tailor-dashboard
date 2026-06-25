import { memo } from "react"
import type { StagedDelivery } from "@/types/deliver-work";
function DeliveryQueueRowComponent({ delivery, onRemove }: { delivery: StagedDelivery; onRemove: (id: string) => void }) {
  return (
    <tr className="border-b border-gray-100 transition hover:bg-gray-50">
      <td className="border border-gray-200 px-2 py-2 font-semibold text-gray-900">{delivery.tailor_name}</td>
      <td className="border border-gray-200 px-2 py-2 text-gray-600">{delivery.customer_ref_id}</td>
      <td className="border border-gray-200 px-2 py-2 text-gray-600">{delivery.quantity ?? "—"}</td>
      <td className="border border-gray-200 px-2 py-2 text-gray-500 italic">{delivery.comment || "—"}</td>
      <td className="border border-gray-200 px-2 py-2 text-center">
        <button type="button" onClick={() => onRemove(delivery.id)} className="text-gray-300 transition hover:text-red-500">✕</button>
      </td>
    </tr>
  )
}

export const DeliveryQueueRow = memo(DeliveryQueueRowComponent)