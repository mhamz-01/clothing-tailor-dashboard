import { amountOrDefault, toAmount } from "@/lib/utils/number-input"
import type { GarmentBilling, GarmentDefinition, GarmentOrderFields } from "@/types/garment-form"
import type { OrderPricingSettings } from "@/types/garment-order"

export interface BillingContext {
  // garment_base_prices row for this garment (0 until Settings loads).
  baseTailoringAmount: number
  // order_pricing_settings defaults (cloth / shilling / others), shared by all garments.
  defaults: Pick<OrderPricingSettings, "defaultClothAmount" | "defaultShillingAmount" | "defaultOthersAmount">
  // button_types.price of the picked button type (Shirt); 0 otherwise.
  buttonPrice: number
}

export function parseQuantity(order: GarmentOrderFields): number {
  return Math.trunc(toAmount(order.quantity)) || 1
}

// Same rules as the Shalwar Kameez form: a typed value (even 0) wins, a blank
// box falls back to the Settings default. Tailoring defaults to base price x
// quantity. The button type's price is added to Others Amt on top of whatever
// is typed/defaulted there. Nothing is mirrored into state - the totals are a
// pure function of the inputs, so display, receipt, print and save always agree.
export function computeBilling(def: GarmentDefinition, order: GarmentOrderFields, context: BillingContext): GarmentBilling {
  const quantity = parseQuantity(order)
  const tailoringAmount = amountOrDefault(order.tailoringAmt, quantity * context.baseTailoringAmount)
  const clothAmount = amountOrDefault(order.clothAmount, context.defaults.defaultClothAmount)
  const shillingAmt = amountOrDefault(order.shillingAmt, context.defaults.defaultShillingAmount)
  const typedOthers = def.showOthersAmt ? amountOrDefault(order.othersAmt, context.defaults.defaultOthersAmount) : 0
  const othersAmt = typedOthers + context.buttonPrice
  const advance = toAmount(order.advance)
  const total = tailoringAmount + clothAmount + shillingAmt + othersAmt

  return {
    quantity,
    tailoringAmount,
    clothAmount,
    shillingAmt,
    othersAmt,
    buttonPrice: context.buttonPrice,
    advance,
    total,
    balance: total - advance,
  }
}
