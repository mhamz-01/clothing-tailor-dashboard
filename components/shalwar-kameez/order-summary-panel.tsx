import { ButtonTypePanel } from "@/components/shalwar-kameez/button-type-panel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS, NO_SPINNER_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { OrderAmounts, RadioItem } from "@/types/shalwar-kameez"

interface OrderSummaryPanelProps {
  order: OrderAmounts
  onOrderFieldChange: (key: keyof OrderAmounts, value: string) => void
  // Computed from order_pricing_settings/button_types.price * Suit Qty (see
  // use-shalwar-kameez-form.ts) rather than a tailor-entered order field --
  // read-only here, hence not part of `order`/`onOrderFieldChange`.
  tailoringAmount: number
  total: number
  balance: number
  buttonOptions: RadioItem[]
}

const labelClass = "text-[16px] font-bold text-[#333338]"
const fieldClass = cn(FIELD_CLASS, "h-[22px] text-right tabular-nums")

// Bottom half of the right column: amounts on the left, Button Type list on
// the right, in one bordered box. Mirrors the Claude Design spec (Shalwar
// Kameez Dashboard.dc.html) pixel-for-pixel, including its field labels
// ("Suit Qty", "Cloth Amount", "Shiling Amt").
export function OrderSummaryPanel({ order, onOrderFieldChange, tailoringAmount, total, balance, buttonOptions }: OrderSummaryPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 gap-3 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]">
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
          <Label className={labelClass}>Suit Qty</Label>
          <Input type="number" value={order.quantity} onChange={(e) => onOrderFieldChange("quantity", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Delivery Date</Label>
          <Input type="date" value={order.deliveryDate} onChange={(e) => onOrderFieldChange("deliveryDate", e.target.value)} className={fieldClass} />

          <Label className={labelClass}>Tailoring Amt</Label>
          <Input
            type="number"
            value={tailoringAmount}
            readOnly
            title="Set from Settings — (base amount + selected Button Type's price) × Suit Qty"
            className={cn(fieldClass, NO_SPINNER_CLASS, "bg-[#f0f0f2] text-[#55555c]")}
          />

          <Label className={labelClass}>Cloth Amount</Label>
          <Input
            type="number"
            value={order.clothAmount}
            onChange={(e) => onOrderFieldChange("clothAmount", e.target.value)}
            className={cn(fieldClass, NO_SPINNER_CLASS)}
          />

          <Label className={labelClass}>Shiling Amt</Label>
          <Input
            type="number"
            value={order.shillingAmt}
            onChange={(e) => onOrderFieldChange("shillingAmt", e.target.value)}
            className={cn(fieldClass, NO_SPINNER_CLASS)}
          />

          <Label className={labelClass}>Others Amt</Label>
          <Input
            type="number"
            value={order.othersAmt}
            onChange={(e) => onOrderFieldChange("othersAmt", e.target.value)}
            className={cn(fieldClass, NO_SPINNER_CLASS)}
          />
        </div>

        <div className="mt-0.5 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 border-t border-[#e4e4e9] pt-1.5">
          <Label className="text-[13px] font-bold text-black">Total</Label>
          <div className="flex h-6 items-center justify-end rounded-[3px] border border-black bg-white px-1.5 text-[14px] font-bold tabular-nums text-black">
            Rs {total.toFixed(2)}
          </div>

          <Label className={labelClass}>Advance</Label>
          <Input type="number" value={order.advance} onChange={(e) => onOrderFieldChange("advance", e.target.value)} className={fieldClass} />

          <Label className="text-[13px] font-bold text-black">Balance</Label>
          <div className="flex h-6 items-center justify-end rounded-[3px] border border-black bg-black px-1.5 text-[14px] font-bold tabular-nums text-white">
            Rs {balance.toFixed(2)}
          </div>
        </div>
      </div>

      <ButtonTypePanel options={buttonOptions} />
    </div>
  )
}
