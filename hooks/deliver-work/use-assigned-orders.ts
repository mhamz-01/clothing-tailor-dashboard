"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAssignedOrders } from "@/lib/queries"
import { queryKeys } from "@/lib/queries/keys"
import type { DeliverableOrder } from "@/types/deliver-work"

export function useAssignedOrders() {
  return useQuery<DeliverableOrder[]>({
    queryKey: queryKeys.assignedOrders,
    queryFn: fetchAssignedOrders,
    refetchInterval: 60_000,
  })
}
