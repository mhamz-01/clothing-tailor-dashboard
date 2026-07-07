import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ADMIN_SESSION_DURATION_MS } from "@/lib/constants/admin"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("admin_credentials")
    .select("*")
    .eq("username", username.trim())
    .eq("password", password.trim())
    .maybeSingle()

    if (!data || error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    
    // Add here ↓
    if (!data.is_active) {
      return NextResponse.json({ error: "Account blocked." }, { status: 403 })
    }
    
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "Account expired. Please renew membership." }, { status: 403 })
    }
    

  const sessionExpiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS)

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(sessionExpiresAt)
    .sign(SECRET)

  await supabase
    .from("admin_credentials")
    .update({ session_expires_at: sessionExpiresAt.toISOString() })
    .eq("id", data.id)

  const res = NextResponse.json({ ok: true })
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_DURATION_MS / 1000,
    path: "/",
  })
  return res
}