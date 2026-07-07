import { NextResponse } from "next/server"
import { verifySuperAdminSession } from "@/lib/auth/superadmin"
import { fetchAdmins, insertAdmin } from "@/lib/queries/admins"

export async function GET() {
  if (!(await verifySuperAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admins = await fetchAdmins()
  return NextResponse.json({ admins })
}

export async function POST(req: Request) {
  if (!(await verifySuperAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { username, password } = await req.json()
  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 })
  }

  await insertAdmin(username, password)
  return NextResponse.json({ ok: true })
}
