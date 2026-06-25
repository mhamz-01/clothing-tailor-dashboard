"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchActiveOrderCounts } from "@/lib/queries"

export function useActiveOrderCounts() {
  return useQuery<Map<string, number>>({
    queryKey: ["activeOrderCounts"],
    queryFn: fetchActiveOrderCounts,
  })
}