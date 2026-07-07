import { NextResponse } from "next/server"
import { signSuperAdminToken, SUPERADMIN_COOKIE_NAME } from "@/lib/auth/superadmin"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username !== process.env.SUPER_USERNAME || password !== process.env.SUPER_PASSWORD) {
    return NextResponse.json({ error: "Wrong credentials." }, { status: 401 })
  }

  const token = await signSuperAdminToken()

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SUPERADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  })
  return res
}
