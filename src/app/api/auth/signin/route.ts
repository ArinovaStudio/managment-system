import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Success
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
