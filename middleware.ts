import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith("/admin")) return NextResponse.next()

  // publiczny login
  if (pathname === "/admin/login") {
    const sid = req.cookies.get("admin.sid")?.value
    if (sid) return NextResponse.redirect(new URL("/admin", req.url))
    return NextResponse.next()
  }

  // reszta admina
  const sid = req.cookies.get("admin.sid")?.value
  if (!sid) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }