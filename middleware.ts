import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname, search } = req.nextUrl

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith("/student") && token.role !== "student") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/access-denied", req.url))
  }

  if (pathname.startsWith("/teacher") && token.role !== "teacher") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/teacher/:path*"],
}
