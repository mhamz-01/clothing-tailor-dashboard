import { createClient } from "@/lib/supabase/client"
import type {
  ButtonTypePriceRow,
  CatalogOptions,
  CatalogRow,
  ClientRow,
  ClientSearchQuery,
  CreateShalwarKameezOrderInput,
  DesignCatalogRow,
  LatestClientOrder,
  OrderPricingSettings,
  PartType,
} from "@/types/garment-order"

// RLS is disabled on all garment-order tables (see
// 20260714000000_fix_garment_orders_keys_and_access.sql -- this app has no
// Supabase Auth session to satisfy `authenticated` policies), so the plain
// anon-key browser client works directly here, same as lib/queries/tailors.ts.

function toCatalogRows(rows: { id: number; code: string; image_path: string | null }[]): CatalogRow[] {
  return rows.map((row) => ({ id: row.id, code: row.code, imagePath: row.image_path }))
}

export async function fetchCatalogOptions(): Promise<CatalogOptions> {
  const supabase = createClient()
  const [pocket, bain, collar, daman, button, flags] = await Promise.all([
    supabase.from("pocket_types").select("id, code, image_path"),
    supabase.from("bain_gala_types").select("id, code, image_path"),
    supabase.from("collar_types").select("id, code, image_path"),
    supabase.from("daman_types").select("id, code, image_path"),
    supabase.from("button_types").select("id, code, image_path"),
    supabase.from("style_flag_catalog").select("id, code, image_path"),
  ])

  for (const result of [pocket, bain, collar, daman, button, flags]) {
    if (result.error) throw new Error(result.error.message)
  }

  return {
    pocketTypes: toCatalogRows(pocket.data ?? []),
    bainGalaTypes: toCatalogRows(bain.data ?? []),
    collarTypes: toCatalogRows(collar.data ?? []),
    damanTypes: toCatalogRows(daman.data ?? []),
    buttonTypes: toCatalogRows(button.data ?? []),
    styleFlags: toCatalogRows(flags.data ?? []),
  }
}

// Settings page (gear icon on /tailor/categories) reads/writes these two --
// button_types.price and the order_pricing_settings singleton row (see
// 20260716020000_add_pricing_settings.sql). The Shalwar Kameez order form
// reads them too, to compute Tailoring Amt and default Delivery Date (see
// use-shalwar-kameez-form.ts).
export async function fetchButtonTypePrices(): Promise<ButtonTypePriceRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("button_types").select("code, price")
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({ code: row.code, price: Number(row.price) }))
}

// Upserts by `code` (unique) -- only touches the price column per row, same
// as every other button_types column stays whatever it already was.
export async function updateButtonTypePrices(prices: ButtonTypePriceRow[]): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("button_types").upsert(prices, { onConflict: "code" })
  if (error) throw new Error(error.message)
}

export async function fetchOrderPricingSettings(): Promise<OrderPricingSettings> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_pricing_settings")
    .select("base_tailoring_amount, delivery_turnaround_days")
    .eq("id", 1)
    .single()
  if (error) throw new Error(error.message)
  return {
    baseTailoringAmount: Number(data.base_tailoring_amount),
    deliveryTurnaroundDays: data.delivery_turnaround_days,
  }
}

export async function updateOrderPricingSettings(settings: OrderPricingSettings): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("order_pricing_settings")
    .update({
      base_tailoring_amount: settings.baseTailoringAmount,
      delivery_turnaround_days: settings.deliveryTurnaroundDays,
    })
    .eq("id", 1)
  if (error) throw new Error(error.message)
}

export async function fetchDesignCatalog(partType: PartType): Promise<DesignCatalogRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("design_catalog")
    .select("design_no, image_path")
    .eq("part_type", partType)
    .order("design_no", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({ designNo: row.design_no, imagePath: row.image_path }))
}

type ClientTableRow = { client_id: number; client_no: string; client_name: string; phone_no: string; order_type: string }

function toClientRow(row: ClientTableRow): ClientRow {
  return {
    clientId: row.client_id,
    clientNo: row.client_no,
    clientName: row.client_name,
    phoneNo: row.phone_no,
    orderType: row.order_type,
  }
}

export async function searchClients(query: ClientSearchQuery): Promise<ClientRow[]> {
  const supabase = createClient()
  let request = supabase.from("clients").select("client_id, client_no, client_name, phone_no, order_type")

  if (query.clientNo) request = request.eq("client_no", query.clientNo)
  if (query.clientName) request = request.ilike("client_name", `%${query.clientName}%`)
  if (query.phoneNo) request = request.eq("phone_no", query.phoneNo)

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []).map(toClientRow)
}

// Advisory duplicate check for the Add Client modal -- OR's whichever fields
// are filled in (unlike searchClients' AND, which is for exact lookups) so a
// tailor gets warned if any one of Client No, Name, or Phone already matches
// someone on file. Exact match only (ilike with no wildcards is still
// case-insensitive) -- the caller only runs this once a field is complete,
// not on every keystroke, so a partial substring match would be misleading
// (e.g. "Ali" mid-type matching "Alia", "Khalid", etc.).
export async function findMatchingClients(query: ClientSearchQuery): Promise<ClientRow[]> {
  const supabase = createClient()
  const escape = (value: string) => value.replace(/[,()]/g, "")
  const filters: string[] = []
  if (query.clientNo) filters.push(`client_no.eq.${escape(query.clientNo)}`)
  if (query.clientName) filters.push(`client_name.ilike.${escape(query.clientName)}`)
  if (query.phoneNo) filters.push(`phone_no.eq.${escape(query.phoneNo)}`)
  if (filters.length === 0) return []

  const { data, error } = await supabase
    .from("clients")
    .select("client_id, client_no, client_name, phone_no, order_type")
    .or(filters.join(","))
    .limit(10)
  if (error) throw new Error(error.message)
  return (data ?? []).map(toClientRow)
}

// garment_orders.client_id is on delete cascade (see
// 20260716000000_cascade_delete_client_orders.sql), which cascades further
// down to shalwar_kameez_details/order_part_designs/order_style_flags -- so
// this removes the client's entire order history, not just the clients row.
export async function deleteClient(clientId: number): Promise<void> {
  const supabase = createClient()
  // .select() forces Postgrest to return the deleted row(s) -- without it, a
  // delete blocked by RLS (or a client_id that no longer exists) still comes
  // back with no error and 0 rows affected, which reads as success unless
  // checked for explicitly. Confirming a row actually came back is the only
  // way to tell "deleted" from "silently did nothing" apart.
  const { data, error } = await supabase.from("clients").delete().eq("client_id", clientId).select("client_id")
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error("Client could not be deleted — they may already be removed, or you may not have permission.")
  }
}

// record_counter (see tailor-schema-supabase.md §8) increments by trigger on
// every garment_orders insert, so total_records + 1 is the next Record No.
export async function fetchNextRecordNo(): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.from("record_counter").select("total_records").eq("id", 1).single()
  if (error) throw new Error(error.message)
  return (data?.total_records ?? 0) + 1
}

// next_client_number (see 20260715000000_add_client_no_next_number.sql) reads
// off an index-only scan over a generated (letter, number desc) index, so
// this stays O(log n) no matter how many clients exist under that letter.
export async function fetchNextClientNumber(letter: string): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("next_client_number", { p_letter: letter })
  if (error) throw new Error(error.message)
  return data as number
}

// fetch_latest_order_for_client (see
// 20260715010000_add_fetch_latest_order_for_client.sql) joins client + most
// recent garment_orders/shalwar_kameez_details/style-flags/part-designs
// server-side in one round trip -- returns null if the client has no order on
// file yet. Used to prefill the whole form when a tailor types a returning
// client's Client No. directly (see use-shalwar-kameez-form.ts).
export async function fetchLatestOrderForClient(clientNo: string): Promise<LatestClientOrder | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("fetch_latest_order_for_client", { p_client_no: clientNo })
  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as {
    order_id: number
    client_name: string
    phone_no: string
    measurements: {
      lambai: number | null
      chaati: number | null
      bazu: number | null
      teera: number | null
      collar: number | null
      kamar: number | null
      daman: number | null
      shalwar_lambai: number | null
      pancha: number | null
    }
    note1: string | null
    note2: string | null
    pocket_type_code: string | null
    bain_gala_type_code: string | null
    collar_type_code: string | null
    daman_type_code: string | null
    button_type_code: string | null
    bain_size: string | null
    collar_size: string | null
    style_flag_codes: string[]
    part_designs: { part_type: PartType; size1: number | null; size2: number | null; design_no: number | null }[]
  }

  return {
    recordNo: row.order_id,
    clientName: row.client_name,
    phoneNo: row.phone_no,
    measurements: {
      lambai: row.measurements.lambai,
      chaati: row.measurements.chaati,
      bazu: row.measurements.bazu,
      teera: row.measurements.teera,
      collar: row.measurements.collar,
      kamar: row.measurements.kamar,
      daman: row.measurements.daman,
      shalwarLambai: row.measurements.shalwar_lambai,
      pancha: row.measurements.pancha,
    },
    note1: row.note1,
    note2: row.note2,
    pocketTypeCode: row.pocket_type_code,
    bainGalaTypeCode: row.bain_gala_type_code,
    collarTypeCode: row.collar_type_code,
    damanTypeCode: row.daman_type_code,
    buttonTypeCode: row.button_type_code,
    bainSize: row.bain_size,
    collarSize: row.collar_size,
    styleFlagCodes: row.style_flag_codes ?? [],
    partDesigns: (row.part_designs ?? []).map((part) => ({
      partType: part.part_type,
      size1: part.size1,
      size2: part.size2,
      designNo: part.design_no,
    })),
  }
}

export async function createShalwarKameezOrder(input: CreateShalwarKameezOrderInput): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("create_shalwar_kameez_order", {
    p_client_no: input.clientNo,
    p_client_name: input.clientName,
    p_phone_no: input.phoneNo,
    p_order_type: input.orderType,
    p_quantity: input.quantity,
    p_delivery_date: input.deliveryDate,
    p_tailoring_amount: input.tailoringAmount,
    p_cloth_amount: input.clothAmount,
    p_shilling_amt: input.shillingAmt,
    p_others_amt: input.othersAmt,
    p_advance_amt: input.advanceAmt,
    p_measurements: {
      lambai: input.measurements.lambai,
      chaati: input.measurements.chaati,
      bazu: input.measurements.bazu,
      teera: input.measurements.teera,
      collar: input.measurements.collar,
      kamar: input.measurements.kamar,
      daman: input.measurements.daman,
      shalwar_lambai: input.measurements.shalwarLambai,
      pancha: input.measurements.pancha,
    },
    p_note1: input.note1,
    p_note2: input.note2,
    p_pocket_type_code: input.pocketTypeCode,
    p_bain_gala_type_code: input.bainGalaTypeCode,
    p_collar_type_code: input.collarTypeCode,
    p_daman_type_code: input.damanTypeCode,
    p_button_type_code: input.buttonTypeCode,
    p_bain_size: input.bainSize,
    p_collar_size: input.collarSize,
    p_style_flag_codes: input.styleFlagCodes,
    p_part_designs: input.partDesigns.map((part) => ({
      part_type: part.partType,
      size1: part.size1,
      size2: part.size2,
      design_no: part.designNo,
    })),
  })
  if (error) throw new Error(error.message)
  return data as number
}
