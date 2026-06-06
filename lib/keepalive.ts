import { createClient } from "@/lib/supabase/client"

export async function pingDatabase() {
  const supabase = createClient()
  
  // Insert dummy row
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

  if (error || !data) return

  // Delete it immediately
  await supabase.from("orders").delete().eq("id", data.id)
}