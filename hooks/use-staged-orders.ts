"use client"

import { useCallback, useMemo, useState } from "react"
import type { StagedOrder } from "@/types/assign-work"

export function useStagedOrders() {
  const [stagedOrders, setStagedOrders] = useState<StagedOrder[]>([])

  const totalQuantity = useMemo(() => stagedOrders.reduce((sum, o) => sum + o.quantity, 0), [stagedOrders])

  const addStagedOrder = useCallback((order: StagedOrder) => {
    setStagedOrders((prev) => [...prev, order])
  }, [])

  const removeStagedOrder = useCallback((tempId: string) => {
    setStagedOrders((prev) => prev.filter((o) => o.tempId !== tempId))
  }, [])

  const clearStagedOrders = useCallback(() => setStagedOrders([]), [])

  const countStagedForTailor = useCallback(
    (tailorId: string) => stagedOrders.filter((o) => o.tailor_id === tailorId).length,
    [stagedOrders]
  )

  return { stagedOrders, totalQuantity, addStagedOrder, removeStagedOrder, clearStagedOrders, countStagedForTailor }
}