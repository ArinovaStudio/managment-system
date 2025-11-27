// import { NextResponse, NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// // ROLE RULES FOR YOUR ENTIRE BACKEND
// const accessControl: Record<string, string[]> = {
//   // task system
//   "/api/kanban/create": ["admin"],
//   "/api/kanban/:id": ["admin","user"],
//   "/api/kanban": ["admin", "user"],
// };

// // helper → find closest matching path rule
// function getAllowedRoles(pathname: string) {
//   const rule = Object.keys(accessControl).find((key) =>
//     pathname.startsWith(key)
//   );
//   return rule ? accessControl[rule] : null;
// }

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const allowedRoles = getAllowedRoles(pathname);

//   // If no rule → route is public
//   if (!allowedRoles) return NextResponse.next();

//   const token = req.cookies.get("token")?.value;

//   if (!token) {
//     return NextResponse.json(
//       { error: "Login required" },
//       { status: 401 }
//     );
//   }

//   try {
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
//     const { payload } = await jwtVerify(token, secret);
//     console.log("-----payload-------",payload)
//     if (!allowedRoles.includes(payload.role as string)) {
//       return NextResponse.json(
//         { error: "Access denied" },
//         { status: 403 }
//       );
//     }

//     return NextResponse.next();
//   } catch (err) {
//     console.log(err)
//     return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//   }
// }

// export const config = {
//   matcher: ["/api/:path*"],
// };
