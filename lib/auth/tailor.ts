import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const SECRET = new TextEncoder().encode(process.env.TAILOR_JWT_SECRET!)

export const TAILOR_COOKIE_NAME = "tailor_token"
export const TAILOR_SESSION_DURATION_S = 60 * 60 * 24 * 7 // 7 days

export function signTailorToken(username: string) {
  return new SignJWT({ role: "tailor-customer", username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${TAILOR_SESSION_DURATION_S}s`)
    .sign(SECRET)
}

export async function verifyTailorSession(): Promise<boolean> {
  const token = (await cookies()).get(TAILOR_COOKIE_NAME)?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload.role === "tailor-customer"
  } catch {
    return false
  }
}
