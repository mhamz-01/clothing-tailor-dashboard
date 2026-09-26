import { createServiceRoleClient } from "@/lib/supabase/service"

export async function pingDatabase() {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_ref_id: "__ping__",
      tailor_id: null,
      quantity: 0,
      due_date: new Date().toISOString().split("T")[0],
      status: "assigned",
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Keepalive ping insert returned no data.")
  }

  const { error: deleteError } = await supabase.from("orders").delete().eq("id", data.id)
  if (deleteError) throw new Error(deleteError.message)
}
