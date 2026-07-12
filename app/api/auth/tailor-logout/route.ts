import { NextResponse } from "next/server"
import { TAILOR_COOKIE_NAME } from "@/lib/auth/tailor"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(TAILOR_COOKIE_NAME)
  return res
}
