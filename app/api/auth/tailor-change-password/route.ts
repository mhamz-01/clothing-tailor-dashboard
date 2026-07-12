import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { fetchTailorCredentialByUsername, updateTailorPasswordHash } from "@/lib/queries/tailor-auth"

const MIN_PASSWORD_LENGTH = 6

export async function POST(req: Request) {
  const { username, oldPassword, newPassword } = await req.json()

  if (!username || !oldPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 })
  }

  const credential = await fetchTailorCredentialByUsername(username.trim())
  if (!credential || !credential.is_active) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 })
  }

  const oldPasswordMatches = await bcrypt.compare(oldPassword.trim(), credential.password_hash)
  if (!oldPasswordMatches) {
    return NextResponse.json({ error: "Old password is incorrect." }, { status: 401 })
  }

  const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10)
  await updateTailorPasswordHash(credential.username, newPasswordHash)

  return NextResponse.json({ ok: true })
}
