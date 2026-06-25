import { memo } from "react"
import { formatDate } from "@/lib/utils/date"
import { StatusBadge } from "./status-badge"
import type { Order } from "@/types"
interface OrderRowProps {
  order: Order
  index: number
}

function OrderRowComponent({ order, index }: OrderRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-400">{index + 1}</td>
      <td className="border-r border-gray-100 px-4 py-3 font-semibold text-gray-900">{order.tailor?.name ?? "—"}</td>
      <td className="border-r border-gray-100 px-4 py-3 text-gray-700">{order.customer_ref_id}</td>
      <td className="border-r border-gray-100 px-4 py-3 text-gray-600">{order.quantity ?? "—"}</td>
      <td className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.created_at)}</td>
      <td className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.delivered_at)}</td>
      <td className="border-r border-gray-100 px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 italic">{order.comment || "—"}</td>
    </tr>
  )
}

export const OrderRow = memo(OrderRowComponent)