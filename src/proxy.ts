import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/signin", "/signup", "/unauthorized", "/forgot-password"];

// Employee blocked route keywords
const employeeBlocked = [
  "client",
  "user",
  "leavemanage",
  "quotes",
  "user-performance",
  "well-being-management",
];

// Role-wise safe home routes
const roleHome: Record<string, string> = {
  ADMIN: "/",
  EMPLOYEE: "/",
  CLIENT: "/client",
};

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();

  /* -------------------------------------------------
     1️⃣ ALLOW ALL API ROUTES (CRITICAL)
  -------------------------------------------------- */
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  /* -------------------------------------------------
     2️⃣ ALLOW PUBLIC ROUTES
  -------------------------------------------------- */
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  /* -------------------------------------------------
     3️⃣ READ AUTH COOKIES
  -------------------------------------------------- */
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  /* -------------------------------------------------
     4️⃣ NOT LOGGED IN → SIGNIN
  -------------------------------------------------- */
  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  /* -------------------------------------------------
     5️⃣ BLOCK SIGNIN / SIGNUP FOR LOGGED USERS
  -------------------------------------------------- */
  if (publicRoutes.includes(pathname) && token && role) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome[role];
    return NextResponse.redirect(url);
  }

  /* -------------------------------------------------
     6️⃣ ALLOW ROLE HOME (PREVENT LOOP)
  -------------------------------------------------- */
  if (pathname === roleHome[role]) {
    return NextResponse.next();
  }

  /* -------------------------------------------------
     7️⃣ ADMIN RULES
     - Full access except /client/**
  -------------------------------------------------- */
  if (role === "ADMIN") {
    if (pathname === "/client" || pathname.startsWith("/client/")) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.ADMIN;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* -------------------------------------------------
     8️⃣ EMPLOYEE RULES
  -------------------------------------------------- */
  if (role === "EMPLOYEE") {
    if (employeeBlocked.some((part) => pathname.includes(part))) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.EMPLOYEE;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* -------------------------------------------------
     9️⃣ CLIENT RULES
     - ONLY /client/**
  -------------------------------------------------- */

  if (role === "CLIENT") {
    if (pathname.startsWith("/profile")) {
      return NextResponse.next();
    }
  }

  if (role === "CLIENT") {
    if (!(pathname === "/client" || pathname.startsWith("/client/"))) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.CLIENT;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|static|favicon.ico|images|fonts).*)",
  ],
};
