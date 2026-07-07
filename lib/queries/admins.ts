import { createServiceRoleClient } from "@/lib/supabase/service"
import { ADMIN_MEMBERSHIP_DURATION_MS } from "@/lib/constants/admin"
import type { AdminCredential } from "@/types/admin"

export async function fetchAdmins(): Promise<AdminCredential[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("admin_credentials")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function insertAdmin(username: string, password: string) {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("admin_credentials").insert({
    id: crypto.randomUUID(),
    username: username.trim(),
    password: password.trim(),
    is_active: true,
    is_superadmin: false,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + ADMIN_MEMBERSHIP_DURATION_MS).toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function setAdminActive(id: string, isActive: boolean) {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("admin_credentials").update({ is_active: isActive }).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function renewAdminMembership(id: string) {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("admin_credentials")
    .update({
      expires_at: new Date(Date.now() + ADMIN_MEMBERSHIP_DURATION_MS).toISOString(),
      is_active: true,
    })
    .eq("id", id)
  if (error) throw new Error(error.message)
}
