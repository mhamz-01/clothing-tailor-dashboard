"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"
import { toast } from "@/hooks/shared/use-toast"
import type { AdminCredential } from "@/types"

const SESSION_QUERY_KEY = ["superadminSession"] as const

async function parseJsonOrThrow(res: Response) {
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? "Request failed.")
  return body
}

export function useSuperAdminSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/auth/superadmin-session")
      const body = await parseJsonOrThrow(res)
      return body.authenticated as boolean
    },
  })
}

export function useSuperAdminLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch("/api/auth/superadmin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      await parseJsonOrThrow(res)
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, true)
    },
  })
}

export function useSuperAdminAdmins(enabled: boolean) {
  return useQuery<AdminCredential[]>({
    queryKey: queryKeys.admins,
    queryFn: async () => {
      const res = await fetch("/api/superadmin/admins")
      const body = await parseJsonOrThrow(res)
      return body.admins
    },
    enabled,
    refetchInterval: 60_000,
  })
}

export function useAddAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      await parseJsonOrThrow(res)
    },
    onSuccess: () => {
      toast({ title: "User added successfully." })
      queryClient.invalidateQueries({ queryKey: queryKeys.admins })
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}

export function useToggleAdminActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/superadmin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", isActive }),
      })
      await parseJsonOrThrow(res)
    },
    onSuccess: (_data, { isActive }) => {
      toast({ title: isActive ? "User activated." : "User blocked." })
      queryClient.invalidateQueries({ queryKey: queryKeys.admins })
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}

export function useRenewAdminMembership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/superadmin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew" }),
      })
      await parseJsonOrThrow(res)
    },
    onSuccess: () => {
      toast({ title: "Membership renewed for 1 year." })
      queryClient.invalidateQueries({ queryKey: queryKeys.admins })
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
}
