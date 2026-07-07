"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAssignedOrdersWithTailors } from "@/lib/queries"
import { queryKeys } from "@/lib/queries/keys"
import type { AssignedOrder } from "@/types"

export function useAssignedOrdersManage() {
  return useQuery<AssignedOrder[]>({
    queryKey: queryKeys.assignedOrdersManage,
    queryFn: fetchAssignedOrdersWithTailors,
    staleTime: 1000 * 30,
  })
}
