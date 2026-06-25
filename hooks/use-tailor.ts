"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTailors } from "@/lib/queries"
import type { TailorRow } from "@/types/assign-work"

export function useTailors() {
  return useQuery<TailorRow[]>({ queryKey: ["tailors"], queryFn: fetchTailors })
}