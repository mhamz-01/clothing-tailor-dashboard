import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signTailorToken, TAILOR_COOKIE_NAME, TAILOR_SESSION_DURATION_S } from "@/lib/auth/tailor"
import { fetchTailorCredentialByUsername } from "@/lib/queries/tailor-auth"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 })
  }

  const credential = await fetchTailorCredentialByUsername(username.trim())

  if (!credential || !credential.is_active) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const passwordMatches = await bcrypt.compare(password.trim(), credential.password_hash)
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const token = await signTailorToken(credential.username)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(TAILOR_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: TAILOR_SESSION_DURATION_S,
    path: "/",
  })
  return res
}
