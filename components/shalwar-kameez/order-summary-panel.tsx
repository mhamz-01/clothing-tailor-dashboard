import { ButtonTypePanel } from "@/components/shalwar-kameez/button-type-panel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { OrderAmounts, RadioItem } from "@/types/shalwar-kameez"

interface OrderSummaryPanelProps {
  order: OrderAmounts
  onOrderFieldChange: (key: keyof OrderAmounts, value: string) => void
  total: number
  balance: number
  buttonOptions: RadioItem[]
}

const labelClass = "text-[13px] font-bold text-black"
const fieldClass = cn(FIELD_CLASS, "h-7")
const readonlyClass = "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-bold text-slate-800"

// Button Type sits to the right of the order fields, inside the Order
// Summary umbrella (client request — previously lived in the middle Style
// Options column).
export function OrderSummaryPanel({ order, onOrderFieldChange, total, balance, buttonOptions }: OrderSummaryPanelProps) {
  return (
    <div>
      <div className="mb-1 rounded-md bg-white px-2.5 py-1 text-xs font-bold tracking-wide text-black uppercase">
        Order Summary
      </div>
      <div className="flex gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-2 items-center gap-x-2.5 gap-y-0.5">
          <Label className={labelClass}>Quantity</Label>
          <Input type="number" value={order.quantity} onChange={(e) => onOrderFieldChange("quantity", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Delivery Date</Label>
          <Input type="date" value={order.deliveryDate} onChange={(e) => onOrderFieldChange("deliveryDate", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Tailoring Amt</Label>
          <Input
            type="number"
            value={order.tailoringAmount}
            onChange={(e) => onOrderFieldChange("tailoringAmount", e.target.value)}
            className={fieldClass}
          />

          <Label className={labelClass}>Cloth Amt</Label>
          <Input type="number" value={order.clothAmount} onChange={(e) => onOrderFieldChange("clothAmount", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Shilling Amt</Label>
          <Input type="number" value={order.shillingAmt} onChange={(e) => onOrderFieldChange("shillingAmt", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Others Amt</Label>
          <Input type="number" value={order.othersAmt} onChange={(e) => onOrderFieldChange("othersAmt", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Total</Label>
          <div className={readonlyClass}>Rs {total.toFixed(2)}</div>

          <Label className={labelClass}>Advance</Label>
          <Input type="number" value={order.advance} onChange={(e) => onOrderFieldChange("advance", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Balance</Label>
          <div className={readonlyClass}>Rs {balance.toFixed(2)}</div>
        </div>
        <div className="w-[130px] shrink-0">
          <ButtonTypePanel options={buttonOptions} />
        </div>
      </div>
    </div>
  )
}
