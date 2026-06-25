"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAssignedOrders } from "@/lib/queries"
import type { DeliverableOrder } from "@/types/deliver-work"
export function useAssignedOrders() {
  return useQuery<DeliverableOrder[]>({
    queryKey: ["assignedOrders"],
    queryFn: fetchAssignedOrders,
    refetchInterval: 60_000,
  })
}