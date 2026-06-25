import { PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeliveryQueueRow } from "./delivery-queue-row"
import type { StagedDelivery } from "@/types/deliver-work"
interface DeliveryQueuePanelProps {
  deliveries: StagedDelivery[]
  totalQuantity: number
  onRemove: (id: string) => void
  onClear: () => void
  onDeliverClick: () => void
}

export function DeliveryQueuePanel({ deliveries, totalQuantity, onRemove, onClear, onDeliverClick }: DeliveryQueuePanelProps) {
  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delivery Queue</h2>
            <div className="mt-2 flex items-center gap-5">
              <div>
                <p className="text-[11px] text-gray-400">Orders</p>
                <p className="text-sm font-semibold text-gray-800">{deliveries.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Total Qty</p>
                <p className="text-sm font-semibold text-indigo-600">{totalQuantity}</p>
              </div>
            </div>
          </div>
          {deliveries.length > 0 && (
            <button type="button" onClick={onClear} className="text-xs font-medium text-gray-400 transition hover:text-red-500">Clear</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {deliveries.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <PackageCheck className="mb-3 size-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No orders selected</p>
            <p className="mt-1 text-xs text-gray-400">Select orders from the table</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Tailor</th>
                <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Customer</th>
                <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Qty</th>
                <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Comment</th>
                <th className="border border-gray-200 px-2 py-2 w-6" />
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <DeliveryQueueRow key={delivery.id} delivery={delivery} onRemove={onRemove} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-gray-100 p-4">
        <Button
          onClick={onDeliverClick}
          disabled={deliveries.length === 0}
          className="h-11 w-full rounded-xl bg-black text-sm font-medium hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <PackageCheck className="mr-2 size-4" />
          Deliver Orders
        </Button>
      </div>
    </div>
  )
}