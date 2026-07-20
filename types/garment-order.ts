// DB-facing shapes for the garment_orders schema (see tailor-schema-supabase.md
// and supabase/migrations/20260712000000_create_garment_orders_schema.sql +
// 20260714000000_fix_garment_orders_keys_and_access.sql). Deliberately separate
// from types/shalwar-kameez.ts, which describes the form's current UI state and
// still uses the pre-fix shape (basicChecks split from styleFlags, single `note`)
// -- reconciling the two is a follow-up once the Save button is wired up.

export type PartType = "bazu" | "kuf" | "button_patti" | "jaib"

export interface CatalogRow {
  id: number
  code: string
  imagePath: string | null
}

export interface CatalogOptions {
  pocketTypes: CatalogRow[]
  bainGalaTypes: CatalogRow[]
  collarTypes: CatalogRow[]
  damanTypes: CatalogRow[]
  buttonTypes: CatalogRow[]
  styleFlags: CatalogRow[]
}

export interface DesignCatalogRow {
  designNo: number
  imagePath: string
}

export interface ClientRow {
  clientId: number
  clientNo: string
  clientName: string
  phoneNo: string
  orderType: string
}

export interface ClientSearchQuery {
  clientNo?: string
  clientName?: string
  phoneNo?: string
}

export interface OrderMeasurementsInput {
  lambai: number | null
  chaati: number | null
  bazu: number | null
  teera: number | null
  collar: number | null
  kamar: number | null
  daman: number | null
  shalwarLambai: number | null
  pancha: number | null
}

export interface PartDesignInput {
  partType: PartType
  // Free text, not a number -- order_part_designs.size1/size2 are `text`
  // (see 20260720000000_order_part_designs_size_to_text.sql) because the
  // size pickers offer fraction values ("1 1/4") and, for Jaib, dimension
  // pairs ("4x4 1/2") that a numeric column can't hold.
  size1: string | null
  size2: string | null
  designNo: number | null
}

// Result of fetch_latest_order_for_client (see
// 20260715010000_add_fetch_latest_order_for_client.sql) -- the most recent
// order on file for an existing Client No., used to prefill the form when a
// tailor types a returning client's number directly.
export interface LatestOrderMeasurements {
  lambai: number | null
  chaati: number | null
  bazu: number | null
  teera: number | null
  collar: number | null
  kamar: number | null
  daman: number | null
  shalwarLambai: number | null
  pancha: number | null
}

export interface LatestOrderPartDesign {
  partType: PartType
  // See PartDesignInput above -- same text-not-number reasoning.
  size1: string | null
  size2: string | null
  designNo: number | null
}

export interface LatestClientOrder {
  recordNo: number
  clientName: string
  phoneNo: string
  measurements: LatestOrderMeasurements
  note1: string | null
  note2: string | null
  pocketTypeCode: string | null
  bainGalaTypeCode: string | null
  collarTypeCode: string | null
  damanTypeCode: string | null
  buttonTypeCode: string | null
  bainSize: string | null
  collarSize: string | null
  styleFlagCodes: string[]
  partDesigns: LatestOrderPartDesign[]
}

// order_pricing_settings (see 20260716020000_add_pricing_settings.sql) --
// single-row config the tailor edits from the Settings page (gear icon on
// /tailor/categories) and the Shalwar Kameez order form reads to compute
// Tailoring Amt and default Delivery Date. Shilling Amt is a plain
// tailor-entered order field, not part of this settings config.
export interface OrderPricingSettings {
  baseTailoringAmount: number
  deliveryTurnaroundDays: number
}

export interface ButtonTypePriceRow {
  code: string
  price: number
}

export interface CreateShalwarKameezOrderInput {
  clientNo: string
  clientName: string
  phoneNo: string
  orderType: string
  quantity: number
  deliveryDate: string
  tailoringAmount: number
  clothAmount: number
  shillingAmt: number
  othersAmt: number
  advanceAmt: number
  measurements: OrderMeasurementsInput
  note1: string | null
  note2: string | null
  pocketTypeCode: string | null
  bainGalaTypeCode: string | null
  collarTypeCode: string | null
  damanTypeCode: string | null
  buttonTypeCode: string | null
  bainSize: string | null
  collarSize: string | null
  styleFlagCodes: string[]
  partDesigns: PartDesignInput[]
}
