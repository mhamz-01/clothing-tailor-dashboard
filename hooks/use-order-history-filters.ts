"use client"

import { useMemo, useState } from "react"
import { useDebouncedValue } from "./use-debounced-values"
import type { Order } from "@/types"
export type StatusFilter = "all" | "assigned" | "delivered"

export function useOrderHistoryFilters(orders: Order[]) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const debouncedSearch = useDebouncedValue(search, 200)

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()

    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        order.customer_ref_id.toLowerCase() === q ||
        (order.tailor?.name ?? "").toLowerCase().includes(q) ||
        (order.comment ?? "").toLowerCase().includes(q)

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, debouncedSearch, statusFilter])

  return { search, setSearch, statusFilter, setStatusFilter, filtered }
}