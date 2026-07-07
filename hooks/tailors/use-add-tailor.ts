"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { insertTailor } from "@/lib/queries"
import { queryKeys } from "@/lib/queries/keys"
import { toast } from "@/hooks/shared/use-toast"

export function useAddTailor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: insertTailor,
    onSuccess: () => {
      toast({ title: "Success", description: "Tailor added successfully." })
      queryClient.invalidateQueries({ queryKey: queryKeys.tailors })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })
}
