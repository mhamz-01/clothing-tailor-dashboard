import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export const SUPERADMIN_COOKIE_NAME = "superadmin_token"

export function signSuperAdminToken() {
  return new SignJWT({ role: "superadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(SECRET)
}

export async function verifySuperAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(SUPERADMIN_COOKIE_NAME)?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload.role === "superadmin"
  } catch {
    return false
  }
}
