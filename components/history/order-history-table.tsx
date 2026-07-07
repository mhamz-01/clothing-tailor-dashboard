import { cn } from "@/lib/utils"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderRow } from "./order-row"
import type { Order } from "@/types"
const COLUMNS = ["#", "Tailor", "Customer ID", "Qty", "Assigned On", "Delivered On", "Status", "Comment"]

export function OrderHistoryTable({ orders }: { orders: Order[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <Table className="border-collapse">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
              {COLUMNS.map((col, i) => (
                <TableHead
                  key={col}
                  className={cn(
                    "h-auto px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-500",
                    i !== COLUMNS.length - 1 && "border-r border-gray-200"
                  )}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <OrderRow key={order.id} order={order} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}