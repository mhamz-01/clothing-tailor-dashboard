"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { insertOrders, updateOrderTailor } from "@/lib/api/admin"
import { queryKeys } from "@/lib/queries/keys"
import { toast } from "@/hooks/shared/use-toast"
import type { StagedOrder } from "@/types/assign-work"

export function useInsertOrders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orders: StagedOrder[]) => insertOrders(orders),
    onSuccess: (_data, orders) => {
      toast({ title: "Work assigned!", description: `${orders.length} order${orders.length > 1 ? "s" : ""} submitted.` })
      queryClient.invalidateQueries({ queryKey: queryKeys.tailors })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeOrderCounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignedOrdersManage })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}

export function useUpdateOrderTailor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, tailorId }: { orderId: string; tailorId: string }) => updateOrderTailor(orderId, tailorId),
    onSuccess: () => {
      toast({ title: "Tailor updated successfully." })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignedOrdersManage })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeOrderCounts })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}
