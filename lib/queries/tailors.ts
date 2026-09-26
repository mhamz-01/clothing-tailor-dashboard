import { createServiceRoleClient } from "@/lib/supabase/service"
import type { TailorRow } from "@/types/assign-work"

export async function fetchTailors(): Promise<TailorRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("tailors")
    .select("id, name")
    .order("name", { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export interface InsertTailorInput {
  name: string
  phone: string
  skills: string
}

export async function insertTailor(values: InsertTailorInput) {
  const supabase = createServiceRoleClient()
  const tailorRefId = `T${Date.now().toString().slice(-6)}`
  const { error } = await supabase.from("tailors").insert({
    tailor_ref_id: tailorRefId,
    name: values.name.trim(),
    phone: values.phone.trim(),
    skills: values.skills.trim() || null,
  })
  if (error) throw new Error(error.message)
}

export async function deleteTailor(id: string) {
  const supabase = createServiceRoleClient()

  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("tailor_id", id)
    .eq("status", "assigned")
  if (countError) throw new Error(countError.message)

  if ((count ?? 0) > 0) {
    throw new Error(
      `This tailor has ${count} active order${count === 1 ? "" : "s"} assigned. Deliver or reassign them before deleting.`
    )
  }

  const { error } = await supabase.from("tailors").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
