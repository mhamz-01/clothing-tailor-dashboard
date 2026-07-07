"use client"

import { useCallback, useMemo, useState } from "react"
import type { DeliverableOrder, StagedDelivery } from "@/types/deliver-work"

export function useStagedDeliveries() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [stagedDeliveries, setStagedDeliveries] = useState<StagedDelivery[]>([])

  const totalQuantity = useMemo(
    () => stagedDeliveries.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [stagedDeliveries]
  )

  const toggleOrder = useCallback((order: DeliverableOrder, checked: boolean, currentComment: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(order.id)
      else next.delete(order.id)
      return next
    })

    setStagedDeliveries((prev) => {
      if (checked) {
        if (prev.some((p) => p.id === order.id)) return prev
        return [
          ...prev,
          {
            id: order.id,
            customer_ref_id: order.customer_ref_id,
            tailor_name: order.tailor?.name ?? "—",
            quantity: order.quantity,
            comment: currentComment,
          },
        ]
      }
      return prev.filter((p) => p.id !== order.id)
    })
  }, [])

  const toggleAll = useCallback(
    (orders: DeliverableOrder[], checked: boolean, comments: Record<string, string>) => {
      setCheckedIds((prev) => {
        const next = new Set(prev)
        if (checked) orders.forEach((o) => next.add(o.id))
        else orders.forEach((o) => next.delete(o.id))
        return next
      })

      setStagedDeliveries((prev) => {
        if (checked) {
          const existingIds = new Set(prev.map((p) => p.id))
          const additions = orders
            .filter((o) => !existingIds.has(o.id))
            .map((o) => ({
              id: o.id,
              customer_ref_id: o.customer_ref_id,
              tailor_name: o.tailor?.name ?? "—",
              quantity: o.quantity,
              comment: comments[o.id] ?? "",
            }))
          return [...prev, ...additions]
        }
        const removeIds = new Set(orders.map((o) => o.id))
        return prev.filter((p) => !removeIds.has(p.id))
      })
    },
    []
  )

  const removeFromStaged = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setStagedDeliveries((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearStaged = useCallback(() => {
    setCheckedIds(new Set())
    setStagedDeliveries([])
  }, [])

  return { checkedIds, stagedDeliveries, totalQuantity, toggleOrder, toggleAll, removeFromStaged, clearStaged }
}
