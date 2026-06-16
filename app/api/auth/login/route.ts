import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
    

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}