"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchButtonTypePrices } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"

// button_types.price, keyed by code -- read by both the Settings page (gear
// icon on /tailor/categories) and the Shalwar Kameez order form's Tailoring
// Amt calculation (see use-shalwar-kameez-form.ts).
export function useButtonPrices() {
  const query = useQuery({ queryKey: queryKeys.buttonPrices, queryFn: fetchButtonTypePrices })

  const pricesByCode = useMemo(
    () => Object.fromEntries((query.data ?? []).map((row) => [row.code, row.price])),
    [query.data]
  )

  return { ...query, pricesByCode }
}
