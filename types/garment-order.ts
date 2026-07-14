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
  size1: number | null
  size2: number | null
  designNo: number | null
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
  styleFlagCodes: string[]
  partDesigns: PartDesignInput[]
}
