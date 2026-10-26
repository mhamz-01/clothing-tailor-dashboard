// Types for the data-driven Waistcoat / Pant / Coat / Shirt order forms.
// Each garment is described once by a GarmentDefinition (lib/garments/*) and
// rendered by the same components/hooks - nothing here knows a specific garment.
// DB-facing shapes live in types/garment-order.ts; Shalwar Kameez keeps its own
// bespoke types in types/shalwar-kameez.ts.

import type { PartDesignInput } from "@/types/garment-order"
import type { PartDesignRowState } from "@/types/shalwar-kameez"

export type GarmentKey = "waistcoat" | "pant" | "coat" | "shirt"

// How a single-select option is stored: its details-table column type decides
// how the form's string value is cast on save (text/enum, smallint, numeric).
export type OptionValueKind = "text" | "int" | "decimal"

export interface OptionChoice {
  value: string
  label: string
}

// One measurement row. `column` is the details-table column; `secondColumn`
// adds a second value box on the same row (Shirt sheet).
export interface GarmentMeasurement {
  column: string
  ur: string
  secondColumn?: string
}

// A single-select group rendered as one bordered radio row.
export interface RadioSection {
  kind: "radio"
  column: string
  title: string
  titleUr?: string
  choices: OptionChoice[]
  valueKind: OptionValueKind
  // Preselected value on a fresh form and after Clear. "" = nothing selected;
  // every current garment uses "" so the tailor makes each choice.
  defaultValue: string
  // Optional "Design #" dropdown beside the row (Shirt Bain/Gala, Collar/Cut).
  designNo?: { column: string; label: string; choices: OptionChoice[] }
}

// A row of independent checkboxes. Every flags section of a garment writes
// into the same array column (`style_flags`).
export interface FlagsSection {
  kind: "flags"
  column: string
  flags: OptionChoice[]
}

export type OptionSection = RadioSection | FlagsSection

export interface GarmentDefinition {
  key: GarmentKey
  titleUr: string
  titleEn: string
  // Caption of the quantity box ("Suit Qty" on Shirt, "Quantity" elsewhere).
  quantityLabel: string
  // The Pant sheet has no Others Amt box.
  showOthersAmt: boolean
  measurements: GarmentMeasurement[]
  sections: OptionSection[]
  // Bazu / Kuf / Button Patti / Jaib design rows (Shirt only).
  hasPartDesigns: boolean
  // Single-select list shown beside the amounts; the picked choice's
  // button_types.price is added to Others Amt (Shirt only).
  buttonType?: { column: string; choices: OptionChoice[] }
}

// ---- Form values ----------------------------------------------------------

export interface GarmentFormValues {
  // keyed by measurement column / secondColumn
  measurements: Record<string, string>
  // keyed by radio column, designNo column and buttonType column; "" = none
  options: Record<string, string>
  // checked flag codes, across all of the garment's flags sections
  flags: string[]
  parts: PartDesignRowState[]
  note: string
}

export interface GarmentOrderFields {
  quantity: string
  // "" = follow Book Date + turnaround days until the tailor edits it.
  deliveryDate: string
  // Typed amounts. Blank falls back to the Settings default (tailoring:
  // base price x quantity), same rule as Shalwar Kameez.
  tailoringAmt: string
  clothAmount: string
  shillingAmt: string
  othersAmt: string
  advance: string
}

export interface GarmentBilling {
  quantity: number
  tailoringAmount: number
  clothAmount: number
  shillingAmt: number
  // Typed/default Others plus any button-type price.
  othersAmt: number
  buttonPrice: number
  advance: number
  total: number
  balance: number
}

// ---- Persistence ----------------------------------------------------------

export interface CreateGarmentOrderInput {
  clientNo: string
  clientName: string
  phoneNo: string
  quantity: number
  deliveryDate: string
  tailoringAmount: number
  clothAmount: number
  shillingAmt: number
  othersAmt: number
  advanceAmt: number
  // keys are details-table column names
  details: Record<string, unknown>
  partDesigns: PartDesignInput[]
}

// One saved order as returned by get_<garment>_order / fetch_latest_<garment>_order.
export interface GarmentOrderRecord {
  orderId: number
  clientNo: string
  clientName: string
  phoneNo: string
  quantity: number
  deliveryDate: string
  createdAt: string
  tailoringAmount: number
  clothAmount: number
  shillingAmt: number
  othersAmt: number
  totalAmt: number
  advanceAmt: number
  balanceAmt: number
  details: Record<string, unknown>
  partDesigns: PartDesignInput[]
}

export type GarmentBasePrices = Record<GarmentKey, number>
