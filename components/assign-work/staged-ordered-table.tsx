import { memo } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StagedOrder } from "@/types/assign-work";

function StagedOrderRowComponent({ order, onRemove }: { order: StagedOrder; onRemove: (tempId: string) => void }) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium text-slate-800">{order.tailor_name}</td>
      <td className="px-4 py-3 text-slate-600">{order.customer_ref_id}</td>
      <td className="px-4 py-3 text-slate-600">{order.quantity}</td>
      <td className="px-4 py-3 text-right">
        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(order.tempId)} className="size-8 text-slate-400 hover:text-red-500">
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  )
}

const StagedOrderRow = memo(StagedOrderRowComponent)

export function StagedOrdersTable({ orders, onRemove }: { orders: StagedOrder[]; onRemove: (tempId: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b">
            <th className="px-4 py-3 text-left font-medium text-slate-500">Tailor</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Qty</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => <StagedOrderRow key={order.tempId} order={order} onRemove={onRemove} />)}
        </tbody>
      </table>
    </div>
  )
}