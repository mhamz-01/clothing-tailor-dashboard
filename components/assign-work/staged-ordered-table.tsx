import { memo } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { StagedOrder } from "@/types/assign-work";

function StagedOrderRowComponent({ order, onRemove }: { order: StagedOrder; onRemove: (tempId: string) => void }) {
  return (
    <TableRow className="border-b last:border-0">
      <TableCell className="px-4 py-3 font-medium text-slate-800">{order.tailor_name}</TableCell>
      <TableCell className="px-4 py-3 text-slate-600">{order.customer_ref_id}</TableCell>
      <TableCell className="px-4 py-3 text-slate-600">{order.quantity}</TableCell>
      <TableCell className="px-4 py-3 text-right">
        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(order.tempId)} className="size-8 text-slate-400 hover:text-red-500">
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

const StagedOrderRow = memo(StagedOrderRowComponent)

export function StagedOrdersTable({ orders, onRemove }: { orders: StagedOrder[]; onRemove: (tempId: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-b hover:bg-slate-50">
            <TableHead className="h-auto px-4 py-3 text-left font-medium text-slate-500">Tailor</TableHead>
            <TableHead className="h-auto px-4 py-3 text-left font-medium text-slate-500">Customer</TableHead>
            <TableHead className="h-auto px-4 py-3 text-left font-medium text-slate-500">Qty</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => <StagedOrderRow key={order.tempId} order={order} onRemove={onRemove} />)}
        </TableBody>
      </Table>
    </div>
  )
}