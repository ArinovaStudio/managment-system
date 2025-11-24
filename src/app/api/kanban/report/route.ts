import { NextResponse } from "next/server";
import db from "@/lib/client";
import jwt from "jsonwebtoken"; // npm install jsonwebtoken
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token found" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.id; // extract user ID from token

    // Parse body input
    const { message, taskId } = await req.json();

    if (!message || !taskId) {
      return NextResponse.json(
        { error: "Message & Task ID are required" },
        { status: 400 }
      );
    }

    // Create report entry
    const report = await db.report.create({
      data: {
        message,
        taskId,
        reportedBy: userId, // stored as 'reportedBy' in Prisma model
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await db.report.findMany({
      orderBy: {
        createdAt: "desc",
      }
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Get Reports Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}