import { Loader2, SendHorizonal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StagedOrdersFooterProps {
  orderCount: number
  totalQuantity: number
  isSubmitting: boolean
  onSubmit: () => void
}

export function StagedOrdersFooter({ orderCount, totalQuantity, isSubmitting, onSubmit }: StagedOrdersFooterProps) {
  if (orderCount === 0) {
    return <div className="border-t bg-slate-50 px-5 py-4"><p className="text-sm text-slate-400">No orders to submit</p></div>
  }

  return (
    <div className="border-t bg-slate-50 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-400">Orders</p>
            <p className="text-lg font-semibold text-slate-700">{orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Quantity</p>
            <p className="text-lg font-semibold text-slate-900">{totalQuantity}</p>
          </div>
        </div>
        <Button onClick={onSubmit} disabled={isSubmitting} className="h-10 min-w-[180px]">
          {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : <><SendHorizonal className="mr-2 size-4" />Submit Orders</>}
        </Button>
      </div>
    </div>
  )
}