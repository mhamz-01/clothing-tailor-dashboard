// Keys below intentionally mirror the column/enum names in tailor-schema-supabase.md
// (measurements -> shalwar_kameez_details, radios -> *_type_code enums, styleFlags ->
// style_flag_code) so wiring this form up to Supabase later is a straight mapping.

export type MeasurementKey =
  | "lambai"
  | "chaati"
  | "bazu"
  | "teera"
  | "collarM"
  | "kamar"
  | "daman"
  | "shalwarLambai"
  | "pancha"

export interface MeasurementDefinition {
  key: MeasurementKey
  ur: string
}

export type BasicCheckKey = "isLargeButtons" | "shalwarZip"

export type StyleFlagKey = "kafDboty" | "btnDboty" | "noLbl" | "kajPatti" | "twoJeb" | "noJeb"

export interface CheckDefinition<K extends string> {
  key: K
  label: string
}

export type PartDesignKey = "bazu" | "kuf" | "buttonPatti" | "jaib"

export interface PartDesignDefinition {
  key: PartDesignKey
  label: string
  ur: string
}

export interface PartDesignRowState extends PartDesignDefinition {
  size1: string
  size2: string
  designNo: string
}

// One selectable thumbnail in the part-design picker modal — `value` is the
// design number stored to `order_part_designs.design_no` once wired up.
export interface PartDesignImageOption {
  value: string
  src: string
}

export type RadioGroupName = "pocket" | "bain" | "collar" | "daman" | "button"

export interface RadioOptionDefinition {
  value: string
  label: string
}

export interface OrderAmounts {
  quantity: string
  deliveryDate: string
  tailoringAmount: string
  clothAmount: string
  shillingAmt: string
  othersAmt: string
  advance: string
}

export interface ShalwarKameezFormState {
  clientNo: string
  bookDate: string
  recordNo: string
  clientName: string
  phoneNo: string
  pBal: string
  measurements: Record<MeasurementKey, string>
  // Two unlabeled quick-entry boxes below Pancha — purpose not decided yet.
  extraNo1: string
  extraNo2: string
  note: string
  basicChecks: Record<BasicCheckKey, boolean>
  styleFlags: Record<StyleFlagKey, boolean>
  partDesigns: PartDesignRowState[]
  radios: Record<RadioGroupName, string>
  // Numbered quick-pick dropdowns shown alongside the Bain/Gala and Collar Type
  // radio rows — independent of `radios`, no schema column yet.
  bainStyleNo: string
  collarStyleNo: string
  order: OrderAmounts
  statusMsg: string
}

// View-model rows handed to presentational components — each item already carries
// its own change handler so the components stay generic and stateless.
export interface MeasurementRow {
  key: MeasurementKey
  ur: string
  value: string
  onChange: (value: string) => void
}

export interface CheckboxItem {
  key: string
  label: string
  checked: boolean
  onChange: () => void
}

export interface RadioItem {
  value: string
  label: string
  checked: boolean
  onChange: () => void
}
