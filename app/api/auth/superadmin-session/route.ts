import { NextResponse } from "next/server"
import { verifySuperAdminSession } from "@/lib/auth/superadmin"

export async function GET() {
  const authenticated = await verifySuperAdminSession()
  return NextResponse.json({ authenticated })
}
