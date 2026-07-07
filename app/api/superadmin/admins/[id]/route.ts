import { NextResponse } from "next/server"
import { verifySuperAdminSession } from "@/lib/auth/superadmin"
import { renewAdminMembership, setAdminActive } from "@/lib/queries/admins"

type PatchBody =
  | { action: "toggle"; isActive: boolean }
  | { action: "renew" }

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await verifySuperAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await req.json()) as PatchBody

  if (body.action === "toggle") {
    await setAdminActive(id, body.isActive)
  } else if (body.action === "renew") {
    await renewAdminMembership(id)
  } else {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
