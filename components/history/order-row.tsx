import { memo } from "react"
import { formatDate } from "@/lib/utils/date"
import { TableCell, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./status-badge"
import type { Order } from "@/types"
interface OrderRowProps {
  order: Order
  index: number
}

function OrderRowComponent({ order, index }: OrderRowProps) {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50">
      <TableCell className="border-r border-gray-100 px-4 py-3 text-xs text-gray-400">{index + 1}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3 font-semibold text-gray-900">{order.tailor?.name ?? "—"}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3 text-gray-700">{order.customer_ref_id}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3 text-gray-600">{order.quantity ?? "—"}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.created_at)}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.delivered_at)}</TableCell>
      <TableCell className="border-r border-gray-100 px-4 py-3">
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell className="px-4 py-3 text-xs text-gray-500 italic whitespace-normal">{order.comment || "—"}</TableCell>
    </TableRow>
  )
}

export const OrderRow = memo(OrderRowComponent)