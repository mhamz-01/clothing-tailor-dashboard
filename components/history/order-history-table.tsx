import { cn } from "@/lib/utils"
import { OrderRow } from "./order-row"
import type { Order } from "@/types"
const COLUMNS = ["#", "Tailor", "Customer ID", "Qty", "Assigned On", "Delivered On", "Status", "Comment"]

export function OrderHistoryTable({ orders }: { orders: Order[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gray-200 bg-gray-50">
              {COLUMNS.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-gray-500",
                    i !== COLUMNS.length - 1 && "border-r border-gray-200"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <OrderRow key={order.id} order={order} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}