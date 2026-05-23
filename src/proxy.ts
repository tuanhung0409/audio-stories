import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and API routes to pass through
  if (pathname === "/admin" || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protect /admin/dashboard routes
  if (pathname.startsWith("/admin/dashboard")) {
    const authCookie = request.cookies.get("admin-auth");

    if (!authCookie || authCookie.value !== "authenticated") {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
