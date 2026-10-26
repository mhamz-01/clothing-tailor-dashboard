import { ButtonTypePanel } from "@/components/tailor-shared/button-type-panel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS, NO_SPINNER_CLASS } from "@/lib/constants/tailor-form"
import { cn } from "@/lib/utils"
import { handleGridArrowKeyDown } from "@/lib/utils/keyboard-nav"
import type { GarmentBilling, GarmentOrderFields } from "@/types/garment-form"
import type { RadioItem } from "@/types/shalwar-kameez"

interface GarmentBillingPanelProps {
  order: GarmentOrderFields
  // Effective delivery date (auto Book Date + turnaround, or the tailor's own).
  deliveryDate: string
  billing: GarmentBilling
  // Shown in blank amount boxes: what applies if the box is left empty.
  placeholders: { tailoringAmt: number; clothAmount: number; shillingAmt: number; othersAmt: number }
  quantityLabel: string
  showOthersAmt: boolean
  // Shirt only: the Button Type list beside the amounts.
  buttonOptions?: RadioItem[]
  onChange: (key: keyof GarmentOrderFields, value: string) => void
}

type AmountKey = "tailoringAmt" | "clothAmount" | "shillingAmt" | "othersAmt"

const AMOUNT_COL = 0
const BUTTON_COL = 1

const labelClass = "text-[16px] font-bold text-[#333338]"
const fieldClass = cn(FIELD_CLASS, "h-[22px] text-right tabular-nums")

function placeholderFor(amount: number): string | undefined {
  return amount ? String(amount) : undefined
}

// Right column, bottom: quantity, delivery date, the amount boxes, and the
// Total / Advance / Balance block. Tailoring Amt works like the other amounts
// (typed value wins, blank falls back to base price x quantity from Settings);
// Total and Balance are computed, never typed.
export function GarmentBillingPanel({
  order,
  deliveryDate,
  billing,
  placeholders,
  quantityLabel,
  showOthersAmt,
  buttonOptions,
  onChange,
}: GarmentBillingPanelProps) {
  const amountFields: { key: AmountKey; label: string; placeholder: number }[] = [
    { key: "tailoringAmt", label: "Tailoring Amt", placeholder: placeholders.tailoringAmt },
    { key: "clothAmount", label: "Cloth Amount", placeholder: placeholders.clothAmount },
    { key: "shillingAmt", label: "Shiling Amt", placeholder: placeholders.shillingAmt },
    ...(showOthersAmt ? [{ key: "othersAmt" as const, label: "Others Amt", placeholder: placeholders.othersAmt }] : []),
  ]
  // Quantity (0) and Delivery Date (1) come first, then the amounts, then Advance.
  const advanceRow = 2 + amountFields.length

  return (
    <div
      className="flex min-h-0 flex-1 gap-3 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]"
      data-nav-container
      onKeyDown={handleGridArrowKeyDown}
    >
      <div className="flex flex-1 flex-col justify-end gap-1.5">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
          <Label className={labelClass}>{quantityLabel}</Label>
          <Input
            type="number"
            value={order.quantity}
            placeholder="1"
            onChange={(e) => onChange("quantity", e.target.value)}
            className={fieldClass}
            data-nav-row={0}
            data-nav-col={AMOUNT_COL}
          />

          <Label className={labelClass}>Delivery Date</Label>
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => onChange("deliveryDate", e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              e.currentTarget.showPicker?.()
            }}
            className={fieldClass}
            data-nav-row={1}
            data-nav-col={AMOUNT_COL}
          />

          {amountFields.map((field, index) => (
            <AmountRow
              key={field.key}
              label={field.label}
              value={order[field.key]}
              placeholder={placeholderFor(field.placeholder)}
              onChange={(value) => onChange(field.key, value)}
              navRow={2 + index}
              hint={field.key === "othersAmt" && billing.buttonPrice > 0 ? `+ Rs ${billing.buttonPrice} button` : undefined}
            />
          ))}
        </div>

        <div className="mt-0.5 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 border-t border-[#e4e4e9] pt-1.5">
          <Label className="text-[13px] font-bold text-black">Total</Label>
          <div className="flex h-6 items-center justify-end rounded-[3px] border border-black bg-white px-1.5 text-[14px] font-bold tabular-nums text-black">
            Rs {billing.total.toFixed(2)}
          </div>

          <Label className={labelClass}>Advance</Label>
          <Input
            type="number"
            value={order.advance}
            onChange={(e) => onChange("advance", e.target.value)}
            className={cn(fieldClass, NO_SPINNER_CLASS)}
            data-nav-row={advanceRow}
            data-nav-col={AMOUNT_COL}
          />

          <Label className="text-[13px] font-bold text-black">Balance</Label>
          <div className="flex h-6 items-center justify-end rounded-[3px] border border-black bg-black px-1.5 text-[14px] font-bold tabular-nums text-white">
            Rs {billing.balance.toFixed(2)}
          </div>
        </div>
      </div>

      {buttonOptions && (
        <ButtonTypePanel options={buttonOptions} navCol={BUTTON_COL} leftFallbackRow={advanceRow} leftFallbackCol={AMOUNT_COL} />
      )}
    </div>
  )
}

interface AmountRowProps {
  label: string
  value: string
  placeholder: string | undefined
  onChange: (value: string) => void
  navRow: number
  hint?: string
}

function AmountRow({ label, value, placeholder, onChange, navRow, hint }: AmountRowProps) {
  return (
    <>
      <Label className={labelClass}>{label}</Label>
      <div className="flex flex-col items-end gap-0.5">
        <Input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, NO_SPINNER_CLASS, "w-full")}
          data-nav-row={navRow}
          data-nav-col={AMOUNT_COL}
        />
        {hint && <span className="text-[11px] font-semibold text-[#8a8a92]">{hint}</span>}
      </div>
    </>
  )
}
