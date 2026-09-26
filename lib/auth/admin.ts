import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export const ADMIN_COOKIE_NAME = "auth_token"

export async function verifyAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false

  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

// Wraps an /api/admin/* route handler: rejects requests without a valid
// auth_token, and turns any thrown error into a JSON { error } body so the
// client (lib/api/admin.ts) can surface the message in a toast.
export function withAdminSession<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<unknown>
) {
  return async (...args: TArgs) => {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const result = await handler(...args)
      return NextResponse.json(result ?? { ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed."
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}
