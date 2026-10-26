import { coat } from "@/lib/garments/coat"
import { pant } from "@/lib/garments/pant"
import { shirt } from "@/lib/garments/shirt"
import { waistcoat } from "@/lib/garments/waistcoat"
import type { GarmentDefinition, GarmentKey } from "@/types/garment-form"

// The single place a new garment is registered: add its definition file, its
// details table + create/get/fetch_latest functions (supabase/migrations), and
// one line here. Routing, forms, settings and printing pick it up from this map.
export const GARMENTS: Record<GarmentKey, GarmentDefinition> = { waistcoat, pant, coat, shirt }

export const GARMENT_KEYS = Object.keys(GARMENTS) as GarmentKey[]

export function isGarmentKey(value: string): value is GarmentKey {
  return Object.hasOwn(GARMENTS, value)
}
