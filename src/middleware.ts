import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/signin", "/signup", "/unauthorized"];

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
  admin: "/",
  employee: "/",
  client: "/client",
};

export function middleware(req: NextRequest) {
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
  const role = req.cookies.get("role")?.value?.toLowerCase();

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
  if (publicRoutes.includes(pathname)) {
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
  if (role === "admin") {
    if (pathname === "/client" || pathname.startsWith("/client/")) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.admin;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* -------------------------------------------------
     8️⃣ EMPLOYEE RULES
  -------------------------------------------------- */
  if (role === "employee") {
    if (employeeBlocked.some((part) => pathname.includes(part))) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.employee;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* -------------------------------------------------
     9️⃣ CLIENT RULES
     - ONLY /client/**
  -------------------------------------------------- */
  if (role === "client") {
    if (!(pathname === "/client" || pathname.startsWith("/client/"))) {
      const url = req.nextUrl.clone();
      url.pathname = roleHome.client;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|images|fonts).*)",
  ],
};
