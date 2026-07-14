import { createClient } from "@/lib/supabase/client"
import type {
  CatalogOptions,
  CatalogRow,
  ClientRow,
  ClientSearchQuery,
  CreateShalwarKameezOrderInput,
  DesignCatalogRow,
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

export async function searchClients(query: ClientSearchQuery): Promise<ClientRow[]> {
  const supabase = createClient()
  let request = supabase.from("clients").select("client_id, client_no, client_name, phone_no, order_type")

  if (query.clientNo) request = request.eq("client_no", query.clientNo)
  if (query.clientName) request = request.ilike("client_name", `%${query.clientName}%`)
  if (query.phoneNo) request = request.eq("phone_no", query.phoneNo)

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    clientId: row.client_id,
    clientNo: row.client_no,
    clientName: row.client_name,
    phoneNo: row.phone_no,
    orderType: row.order_type,
  }))
}

// record_counter (see tailor-schema-supabase.md §8) increments by trigger on
// every garment_orders insert, so total_records + 1 is the next Record No.
export async function fetchNextRecordNo(): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.from("record_counter").select("total_records").eq("id", 1).single()
  if (error) throw new Error(error.message)
  return (data?.total_records ?? 0) + 1
}

export async function checkClientNoAvailability(clientNo: string): Promise<{ available: boolean; clientName: string | null }> {
  const matches = await searchClients({ clientNo })
  const existing = matches[0] ?? null
  return { available: !existing, clientName: existing?.clientName ?? null }
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
