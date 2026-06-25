"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAssignedOrdersWithTailors } from "@/lib/queries"
import type { AssignedOrder } from "@/types"

export function useAssignedOrdersManage() {
  return useQuery<AssignedOrder[]>({
    queryKey: ["assignedOrdersManage"],
    queryFn: fetchAssignedOrdersWithTailors,
    staleTime: 1000 * 30,
  })
}