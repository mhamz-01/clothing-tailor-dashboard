import { GARMENT_KEYS } from "@/lib/garments/registry"
import { createClient } from "@/lib/supabase/client"
import type {
  CreateGarmentOrderInput,
  GarmentBasePrices,
  GarmentKey,
  GarmentOrderRecord,
} from "@/types/garment-form"
import type { PartDesignInput, PartType } from "@/types/garment-order"

// Data access for the Waistcoat / Pant / Coat / Shirt order forms. One set of
// functions serves all four: the garment key picks the Postgres function
// (create_<garment>_order, get_<garment>_order, fetch_latest_<garment>_order -
// see supabase/migrations/20261027020000). Client lookups (search, add, delete,
// next Client No.) and Record No. preview are shared with Shalwar Kameez and live
// in lib/queries/garment-orders.ts.
//
// RLS is off on these tables like the rest of the tailor module (see
// 20260714000000_fix_garment_orders_keys_and_access.sql), so the anon-key
// browser client is used directly.

interface GarmentOrderJson {
  order_id: number
  client_no: string
  client_name: string
  phone_no: string
  quantity: number
  delivery_date: string
  created_at: string
  tailoring_amount: number
  cloth_amount: number
  shilling_amt: number
  others_amt: number
  total_amt: number
  advance_amt: number
  balance_amt: number
  details: Record<string, unknown>
  // Shirt only
  part_designs?: { part_type: PartType; size1: string | null; size2: string | null; design_no: number | null }[]
}

function toRecord(json: GarmentOrderJson): GarmentOrderRecord {
  return {
    orderId: json.order_id,
    clientNo: json.client_no,
    clientName: json.client_name,
    phoneNo: json.phone_no,
    quantity: json.quantity,
    deliveryDate: json.delivery_date,
    createdAt: json.created_at,
    tailoringAmount: Number(json.tailoring_amount),
    clothAmount: Number(json.cloth_amount),
    shillingAmt: Number(json.shilling_amt),
    othersAmt: Number(json.others_amt),
    totalAmt: Number(json.total_amt),
    advanceAmt: Number(json.advance_amt),
    balanceAmt: Number(json.balance_amt),
    details: json.details,
    partDesigns: (json.part_designs ?? []).map(
      (part): PartDesignInput => ({
        partType: part.part_type,
        size1: part.size1,
        size2: part.size2,
        designNo: part.design_no,
      })
    ),
  }
}

export async function createGarmentOrder(garment: GarmentKey, input: CreateGarmentOrderInput): Promise<number> {
  const supabase = createClient()
  const args: Record<string, unknown> = {
    p_client_no: input.clientNo,
    p_client_name: input.clientName,
    p_phone_no: input.phoneNo,
    p_quantity: input.quantity,
    p_delivery_date: input.deliveryDate,
    p_tailoring_amount: input.tailoringAmount,
    p_cloth_amount: input.clothAmount,
    p_shilling_amt: input.shillingAmt,
    p_others_amt: input.othersAmt,
    p_advance_amt: input.advanceAmt,
    p_details: input.details,
  }
  // Only shirt_part_designs exists; the other create functions take no part list.
  if (garment === "shirt") {
    args.p_part_designs = input.partDesigns.map((part) => ({
      part_type: part.partType,
      size1: part.size1,
      size2: part.size2,
      design_no: part.designNo,
    }))
  }

  const { data, error } = await supabase.rpc(`create_${garment}_order`, args)
  if (error) throw new Error(error.message)
  return data as number
}

// The saved order with this Record No. for this garment, or null (a Record No.
// that belongs to a different garment is "not found" here, by design).
export async function fetchGarmentOrder(garment: GarmentKey, orderId: number): Promise<GarmentOrderRecord | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc(`get_${garment}_order`, { p_order_id: orderId })
  if (error) throw new Error(error.message)
  return data ? toRecord(data as GarmentOrderJson) : null
}

// A client's newest order for this garment, used to prefill the form when a
// returning Client No. is entered. Null when they have none.
export async function fetchLatestGarmentOrder(garment: GarmentKey, clientNo: string): Promise<GarmentOrderRecord | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc(`fetch_latest_${garment}_order`, { p_client_no: clientNo })
  if (error) throw new Error(error.message)
  return data ? toRecord(data as GarmentOrderJson) : null
}

// garment_orders -> <garment>_details (-> shirt_part_designs) all cascade on
// delete. .select() makes PostgREST return the deleted row so a delete that
// matched nothing (already gone, or wrong garment) is reported instead of
// silently reading as success.
export async function deleteGarmentOrder(garment: GarmentKey, orderId: number): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("garment_orders")
    .delete()
    .eq("order_id", orderId)
    .eq("garment_type", garment)
    .select("order_id")
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error(`Record ${orderId} could not be deleted - it may already be removed.`)
}

// garment_base_prices (Settings page). Shalwar Kameez is not in this table.
export async function fetchGarmentBasePrices(): Promise<GarmentBasePrices> {
  const supabase = createClient()
  const { data, error } = await supabase.from("garment_base_prices").select("garment_type, base_tailoring_amount")
  if (error) throw new Error(error.message)

  const prices = Object.fromEntries(GARMENT_KEYS.map((garment) => [garment, 0])) as GarmentBasePrices
  for (const row of data ?? []) {
    if (row.garment_type in prices) prices[row.garment_type as GarmentKey] = Number(row.base_tailoring_amount)
  }
  return prices
}

export async function updateGarmentBasePrices(prices: GarmentBasePrices): Promise<void> {
  const supabase = createClient()
  const rows = (Object.keys(prices) as GarmentKey[]).map((garment) => ({
    garment_type: garment,
    base_tailoring_amount: prices[garment],
  }))
  const { error } = await supabase.from("garment_base_prices").upsert(rows, { onConflict: "garment_type" })
  if (error) throw new Error(error.message)
}
