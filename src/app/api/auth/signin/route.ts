import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check if input is email or employee ID
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: email },
          { employeeId: email }
        ]
      }
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role, // IMPORTANT
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });

    // -----------------------------
    // SET TOKEN COOKIE (secure)
    // -----------------------------
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // -----------------------------
    // SET ROLE COOKIE (MIDDLEWARE NEEDS THIS)
    // -----------------------------
    response.cookies.set("role", user.role, {
      httpOnly: false, // MUST be false or middleware can't read it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Signin API is working" });
}
