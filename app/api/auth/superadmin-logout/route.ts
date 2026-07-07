import { NextResponse } from "next/server"
import { SUPERADMIN_COOKIE_NAME } from "@/lib/auth/superadmin"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SUPERADMIN_COOKIE_NAME)
  return res
}
