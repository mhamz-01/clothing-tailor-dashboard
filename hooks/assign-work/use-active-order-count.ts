"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchActiveOrderCounts } from "@/lib/api/admin"
import { queryKeys } from "@/lib/queries/keys"

export function useActiveOrderCounts() {
  return useQuery<Map<string, number>>({
    queryKey: queryKeys.activeOrderCounts,
    queryFn: fetchActiveOrderCounts,
  })
}
