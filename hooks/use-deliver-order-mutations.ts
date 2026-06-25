"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { StagedDelivery } from "@/types/deliver-work"

export function useDeliverOrdersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deliveries: StagedDelivery[]) => {
      const supabase = createClient()
      const results = await Promise.all(
        deliveries.map((d) =>
          supabase
            .from("orders")
            .update({
              status: "delivered",
              delivered_at: new Date().toISOString(),
              comment: d.comment.trim() || null,
            })
            .eq("id", d.id)
        )
      )

      const failed = results.filter((r) => r.error)
      if (failed.length > 0) throw new Error("Some orders failed to update. Please try again.")
    },
    onSuccess: (_data, deliveries) => {
      toast({
        title: "Success",
        description: `${deliveries.length} order${deliveries.length > 1 ? "s" : ""} delivered successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ["assignedOrders"] })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}