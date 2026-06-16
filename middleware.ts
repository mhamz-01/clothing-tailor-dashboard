import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ["/dashboard/:path*", "/tailors/:path*", "/orders/:path*", "/history/:path*", "/login"],
}