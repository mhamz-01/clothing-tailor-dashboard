import { memo } from "react"
import { cn } from "@/lib/utils"
import type { DeliverableOrder } from "@/types/deliver-work"
interface OrderRowProps {
  order: DeliverableOrder
  comment: string
  isChecked: boolean
  onToggle: (order: DeliverableOrder, checked: boolean, comment: string) => void
  onCommentChange: (orderId: string, value: string) => void
}

function OrderRowComponent({ order, comment, isChecked, onToggle, onCommentChange }: OrderRowProps) {
  return (
    <tr className={cn("border-b border-gray-100 transition-colors", isChecked ? "bg-indigo-50" : "bg-white hover:bg-gray-50")}>
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onToggle(order, e.target.checked, comment)}
          className="size-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
        />
      </td>
      <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.customer_ref_id}</td>
      <td className="px-4 py-4 text-sm text-gray-700">{order.tailor?.name ?? "—"}</td>
      <td className="px-4 py-4 text-sm text-gray-600">{order.quantity ?? "—"}</td>
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="Comment..."
          value={comment}
          onChange={(e) => onCommentChange(order.id, e.target.value)}
          className="w-full min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </td>
    </tr>
  )
}

export const OrderRow = memo(OrderRowComponent)