import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("qrevnt_auth")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // Simulasi: kita pake cookie (nanti kita set pas login)
  // Untuk sementara, biarkan akses dulu ya Adek
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};