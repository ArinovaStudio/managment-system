import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
import { generateAndSendOtp, verifyOtp } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const { email, password, action, otp } = await req.json();

    if (action === "verify-credentials") {
      // Verify credentials and send OTP
      const user = await db.user.findFirst({
        where: {
          OR: [
            { email: email },
            { employeeId: email }
          ]
        }
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Send OTP
      await generateAndSendOtp(user.email, "FORGOT_PASSWORD");
      return NextResponse.json({ message: "OTP sent to your email" });
    }

    if (action === "signin-with-otp") {
      // Verify OTP and complete signin
      const user = await db.user.findFirst({
        where: {
          OR: [
            { email: email },
            { employeeId: email }
          ]
        }
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Verify OTP
      const isOtpValid = await verifyOtp(user.email, otp, "FORGOT_PASSWORD");
      if (!isOtpValid) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Complete signin
      const token = createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
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

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("role", user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
