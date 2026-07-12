import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const TAILOR_SECRET = new TextEncoder().encode(process.env.TAILOR_JWT_SECRET!)

// Admin/superadmin session guard — unrelated to the tailor-customer module below.
async function handleAdminAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const isLoginPage = request.nextUrl.pathname === "/login"

  if (isLoginPage) {
    if (token) {
      try {
        await jwtVerify(token, SECRET)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch {}
    }
    return NextResponse.next()
  }

  if (!token) return NextResponse.redirect(new URL("/login", request.url))

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// tailor-customer module session guard (app/tailor/**) — its own cookie
// (tailor_token) and secret (TAILOR_JWT_SECRET), fully independent from the
// admin/superadmin auth above.
async function handleTailorAuth(request: NextRequest) {
  const token = request.cookies.get("tailor_token")?.value
  const isLoginPage = request.nextUrl.pathname === "/tailor/login"

  if (isLoginPage) {
    if (token) {
      try {
        await jwtVerify(token, TAILOR_SECRET)
        return NextResponse.redirect(new URL("/tailor/categories", request.url))
      } catch {}
    }
    return NextResponse.next()
  }

  if (!token) return NextResponse.redirect(new URL("/tailor/login", request.url))

  try {
    await jwtVerify(token, TAILOR_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/tailor/login", request.url))
  }
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/tailor/")) {
    return handleTailorAuth(request)
  }
  return handleAdminAuth(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tailors/:path*",
    "/orders/:path*",
    "/history/:path*",
    "/login",
    "/tailor/:path*",
  ],
}