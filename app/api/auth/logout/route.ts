import { jwtVerify } from "jose"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServiceRoleClient } from "@/lib/supabase/service"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST() {
  const token = (await cookies()).get("auth_token")?.value

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      const supabase = createServiceRoleClient()
      await supabase
        .from("admin_credentials")
        .update({ session_expires_at: null })
        .eq("username", payload.username)
    } catch {}
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete("auth_token")
  return res
}