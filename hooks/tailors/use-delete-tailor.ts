"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTailor } from "@/lib/queries"
import { queryKeys } from "@/lib/queries/keys"
import { toast } from "@/hooks/shared/use-toast"

export function useDeleteTailor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTailor,
    onSuccess: () => {
      toast({ title: "Tailor deleted." })
      queryClient.invalidateQueries({ queryKey: queryKeys.tailors })
    },
  })
}
