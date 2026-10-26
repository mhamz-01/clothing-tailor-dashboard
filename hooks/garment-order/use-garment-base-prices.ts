"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchGarmentBasePrices, updateGarmentBasePrices } from "@/lib/queries/garment-order-records"
import { queryKeys } from "@/lib/queries/keys"

// garment_base_prices - read by the Settings page and by every
// Waistcoat/Pant/Coat/Shirt order form (Tailoring Amt default = base x quantity).
export function useGarmentBasePrices() {
  return useQuery({ queryKey: queryKeys.garmentBasePrices, queryFn: fetchGarmentBasePrices })
}

// Writes the just-saved prices straight into the cache - the mutation input is
// already the new authoritative state (same approach as the other Settings mutations).
export function useUpdateGarmentBasePrices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateGarmentBasePrices,
    onSuccess: (_data, prices) => {
      queryClient.setQueryData(queryKeys.garmentBasePrices, prices)
    },
  })
}
