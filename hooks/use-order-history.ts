"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchOrderHistory } from "@/lib/queries"
import type { Order } from "@/types"
export function useOrderHistory() {
  return useQuery<Order[]>({
    queryKey: ["orderHistory"],
    queryFn: fetchOrderHistory,
  })
}