import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // --- ADMIN ---
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const sid = req.cookies.get("admin.sid")?.value
      if (sid) return NextResponse.redirect(new URL("/admin", req.url))
      return NextResponse.next()
    }

    const sid = req.cookies.get("admin.sid")?.value
    if (!sid) return NextResponse.redirect(new URL("/admin/login", req.url))

    return NextResponse.next()
  }

  // --- ACCOUNT (CUSTOMER) ---
  if (pathname.startsWith("/account")) {
    const sid = req.cookies.get("customer.sid")?.value
    const isLoggedIn = Boolean(sid)

    const isAuthPage =
      pathname === "/account/login" || pathname === "/account/register"

    if (isLoggedIn && isAuthPage) {
      return NextResponse.redirect(new URL("/account", req.url))
    }

    if (!isLoggedIn && !isAuthPage) {
      return NextResponse.redirect(new URL("/account/login", req.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}