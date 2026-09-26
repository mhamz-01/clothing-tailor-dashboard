"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deliverOrders } from "@/lib/api/admin"
import { queryKeys } from "@/lib/queries/keys"
import { toast } from "@/hooks/shared/use-toast"
import type { StagedDelivery } from "@/types/deliver-work"

export function useDeliverOrdersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deliveries: StagedDelivery[]) => deliverOrders(deliveries),
    onSuccess: (_data, deliveries) => {
      toast({
        title: "Success",
        description: `${deliveries.length} order${deliveries.length > 1 ? "s" : ""} delivered successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignedOrders })
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}
