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

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();

  // Allow auth APIs
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Read cookies
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value?.toLowerCase();

  // ------------------------------------
  // BLOCK SIGNIN/SIGNUP FOR LOGGED-IN USERS
  // ------------------------------------
  if (token && role && publicRoutes.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Public pages allowed when NOT logged in
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // Not logged in → redirect to signin
  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // ------------------------------------
  // ADMIN — FULL ACCESS EXCEPT /client/**
  // ------------------------------------
  if (role === "admin") {
    if (pathname.startsWith("/client")) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ------------------------------------
  // EMPLOYEE — LIMITED ACCESS
  // ------------------------------------
  if (role === "employee") {
    if (employeeBlocked.some((part) => pathname.includes(part))) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ------------------------------------
  // CLIENT — ONLY /client/** ALLOWED
  // ------------------------------------
  if (role === "client") {
    if (!pathname.startsWith("/client")) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|api/auth|images|fonts).*)",
  ],
};
