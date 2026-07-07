import { useEffect, useRef } from "react"
import { CheckCircle2 } from "lucide-react"
import { TableSkeleton } from "../ui/table-skeleton"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderRow } from "./order-row"
import type { DeliverableOrder } from "@/types/deliver-work"
interface OrdersPanelProps {
  orders: DeliverableOrder[]
  isLoading: boolean
  comments: Record<string, string>
  checkedIds: Set<string>
  selectedCount: number
  totalQuantity: number
  onToggleOrder: (order: DeliverableOrder, checked: boolean, comment: string) => void
  onToggleAll: (checked: boolean) => void
  onCommentChange: (orderId: string, value: string) => void
}

export function OrdersPanel({
  orders, isLoading, comments, checkedIds, selectedCount, totalQuantity, onToggleOrder, onToggleAll, onCommentChange,
}: OrdersPanelProps) {
  const allChecked = orders.length > 0 && orders.every((o) => checkedIds.has(o.id))
  const someChecked = !allChecked && orders.some((o) => checkedIds.has(o.id))
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked
  }, [someChecked])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[11px] text-gray-400">Pending Orders</p>
            <p className="text-sm font-semibold text-gray-800">{orders.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400">Total Qty</p>
            <p className="text-sm font-semibold text-gray-900">{totalQuantity}</p>
          </div>
        </div>
        {selectedCount > 0 && (
          <div className="rounded-lg bg-indigo-50 px-3 py-1.5">
            <p className="text-sm font-medium text-indigo-600">{selectedCount} selected</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : orders.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
          <CheckCircle2 className="mb-3 size-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No orders found</p>
          <p className="mt-1 text-xs text-gray-400">Try another search keyword</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-200 bg-white h-[470px]">
          <Table className="border-collapse">
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="w-10 px-4 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    className="size-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead className="h-auto px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-500">Customer</TableHead>
                <TableHead className="h-auto px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-500">Tailor</TableHead>
                <TableHead className="h-auto px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-500">Qty</TableHead>
                <TableHead className="h-auto px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-500">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  comment={comments[order.id] ?? ""}
                  isChecked={checkedIds.has(order.id)}
                  onToggle={onToggleOrder}
                  onCommentChange={onCommentChange}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}