import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { OrderAmounts } from "@/types/shalwar-kameez"

interface OrderSummaryPanelProps {
  order: OrderAmounts
  onOrderFieldChange: (key: keyof OrderAmounts, value: string) => void
  total: number
  balance: number
}

export function OrderSummaryPanel({ order, onOrderFieldChange, total, balance }: OrderSummaryPanelProps) {
  return (
    <div>
      <div className="mb-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-black uppercase">
        Order Summary
      </div>
      <div className="grid grid-cols-2 items-center gap-x-3 gap-y-2">
        <Label className="text-[13px] font-bold text-black">Quantity</Label>
        <Input type="number" value={order.quantity} onChange={(e) => onOrderFieldChange("quantity", e.target.value)} className={cn(FIELD_CLASS, "h-8")} />

        <Label className="text-[13px] font-bold text-black">Delivery Date</Label>
        <Input
          type="date"
          value={order.deliveryDate}
          onChange={(e) => onOrderFieldChange("deliveryDate", e.target.value)}
          className={cn(FIELD_CLASS, "h-8")}
        />

        <Label className="text-[13px] font-bold text-black">Tailoring Amt</Label>
        <Input
          type="number"
          value={order.tailoringAmount}
          onChange={(e) => onOrderFieldChange("tailoringAmount", e.target.value)}
          className={cn(FIELD_CLASS, "h-8")}
        />

        <Label className="text-[13px] font-bold text-black">Cloth Amt</Label>
        <Input
          type="number"
          value={order.clothAmount}
          onChange={(e) => onOrderFieldChange("clothAmount", e.target.value)}
          className={cn(FIELD_CLASS, "h-8")}
        />

        <Label className="text-[13px] font-bold text-black">Shilling Amt</Label>
        <Input
          type="number"
          value={order.shillingAmt}
          onChange={(e) => onOrderFieldChange("shillingAmt", e.target.value)}
          className={cn(FIELD_CLASS, "h-8")}
        />

        <Label className="text-[13px] font-bold text-black">Others Amt</Label>
        <Input
          type="number"
          value={order.othersAmt}
          onChange={(e) => onOrderFieldChange("othersAmt", e.target.value)}
          className={cn(FIELD_CLASS, "h-8")}
        />

        <Label className="text-[13px] font-bold text-black">Total</Label>
        <div className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-sm font-bold text-slate-800">
          Rs {total.toFixed(2)}
        </div>

        <Label className="text-[13px] font-bold text-black">Advance</Label>
        <Input type="number" value={order.advance} onChange={(e) => onOrderFieldChange("advance", e.target.value)} className={cn(FIELD_CLASS, "h-8")} />

        <Label className="text-[13px] font-bold text-black">Balance</Label>
        <div className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-sm font-bold text-slate-800">
          Rs {balance.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
