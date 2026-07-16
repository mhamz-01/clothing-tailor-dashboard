"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchOrderPricingSettings } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"

// order_pricing_settings singleton row -- read by both the Settings page and
// the Shalwar Kameez order form (Tailoring Amt base + Delivery Date
// turnaround, see use-shalwar-kameez-form.ts).
export function usePricingSettings() {
  return useQuery({ queryKey: queryKeys.pricingSettings, queryFn: fetchOrderPricingSettings })
}
