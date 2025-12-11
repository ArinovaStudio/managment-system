import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/signin", "/signup", "/unauthorized"];

// Employee blocked keywords
const employeeBlocked = [
  "client",
  "user",
  "leavemanage",
  "quotes",
  "user-performance",
  "well-being-management",
];

// Client allowed and blocked logic
const clientAllowed = ["client"]; // client must stay inside /client
// everything else will be blocked for client automatically

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();

  // Allow public pages
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // Allow auth APIs
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Get cookies
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value?.toLowerCase();

  // Not logged in
  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // ------------------------------------
  // ADMIN — FULL ACCESS
  // ------------------------------------
  if (role === "admin") return NextResponse.next();

  // ------------------------------------
  // EMPLOYEE — LIMITED ACCESS
  // ------------------------------------
  if (role === "employee") {
    if (employeeBlocked.some((part) => pathname.includes(part))) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ------------------------------------
  // CLIENT — ONLY /client/** ALLOWED
  // ------------------------------------
  if (role === "client") {
    // If URL does NOT start with /client → block
    if (!pathname.startsWith("/client")) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// Ensure middleware runs on ALL app routes including grouped folders
export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|api/auth|images|fonts).*)",
  ],
};
