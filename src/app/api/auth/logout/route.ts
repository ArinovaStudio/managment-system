import { NextResponse } from "next/server";
import { deleteTokenCookie } from "@/lib/jwt"; // we'll make a helper

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the token cookie
    response.headers.set("Set-Cookie", deleteTokenCookie());

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Logout Internal server error" }, { status: 500 });
  }
}
