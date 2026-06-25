"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { StagedOrder } from "@/types/assign-work"

export function useInsertOrders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orders: StagedOrder[]) => {
      const supabase = createClient()
      const { error } = await supabase.from("orders").insert(
        orders.map((o) => ({
          customer_ref_id: o.customer_ref_id,
          tailor_id: o.tailor_id,
          quantity: o.quantity,
          due_date: o.due_date,
          status: "assigned",
          delivered_at: null,
        }))
      )
      if (error) throw new Error(error.message)
    },
    onSuccess: (_data, orders) => {
      toast({ title: "Work assigned!", description: `${orders.length} order${orders.length > 1 ? "s" : ""} submitted.` })
      queryClient.invalidateQueries({ queryKey: ["tailors"] })
      queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
      queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}

export function useUpdateOrderTailor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, tailorId }: { orderId: string; tailorId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ tailor_id: tailorId }).eq("id", orderId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast({ title: "Tailor updated successfully." })
      queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
      queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const supabase = createClient()
      const { error } = await supabase.from("orders").delete().eq("id", orderId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast({ title: "Order removed." })
      queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
      queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}