"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateButtonTypePrices, updateOrderPricingSettings } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"

// Settings page (gear icon on /tailor/categories) mutations. Each writes the
// just-saved value straight into the query cache (setQueryData) instead of
// invalidating -- the mutation's input already is the new authoritative
// state, so the order form picks it up on its next render with no extra
// round trip.
export function useUpdateButtonPrices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateButtonTypePrices,
    onSuccess: (_data, prices) => {
      queryClient.setQueryData(queryKeys.buttonPrices, prices)
    },
  })
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateOrderPricingSettings,
    onSuccess: (_data, settings) => {
      queryClient.setQueryData(queryKeys.pricingSettings, settings)
    },
  })
}
