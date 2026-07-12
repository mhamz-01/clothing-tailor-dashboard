import { createServiceRoleClient } from "@/lib/supabase/service"

export type TailorCredential = {
  id: string
  username: string
  password_hash: string
  is_active: boolean
}

// Service-role only — deliberately excluded from lib/queries/index.ts's
// barrel so it can never be pulled into client-bundled code, same reasoning
// as lib/queries/admins.ts.
export async function fetchTailorCredentialByUsername(username: string): Promise<TailorCredential | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("tailor_credentials")
    .select("id, username, password_hash, is_active")
    .eq("username", username)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function updateTailorPasswordHash(username: string, passwordHash: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("tailor_credentials")
    .update({ password_hash: passwordHash })
    .eq("username", username)
  if (error) throw new Error(error.message)
}
