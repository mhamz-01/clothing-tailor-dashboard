"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTailors } from "@/lib/queries"
import { queryKeys } from "@/lib/queries/keys"
import type { TailorRow } from "@/types/assign-work"

export function useTailors() {
  return useQuery<TailorRow[]>({ queryKey: queryKeys.tailors, queryFn: fetchTailors })
}
