"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchOrderHistory } from "@/lib/api/admin"
import { queryKeys } from "@/lib/queries/keys"
import type { Order } from "@/types"

export function useOrderHistory() {
  return useQuery<Order[]>({
    queryKey: queryKeys.orderHistory,
    queryFn: fetchOrderHistory,
  })
}
