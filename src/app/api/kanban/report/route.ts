import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserIdFromCookies } from "@/lib/getCookies";

export async function POST(req: Request) {
  try {

    const userId = await getUserIdFromCookies();// extract user ID from token

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

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid user" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // Count reports by this user for this task
    const count = await db.report.count({
      where: {
        taskId,
        reportedBy: userId,
      },
    });

      const messages = await db.report.findMany({
      where: {
        taskId,
        reportedBy: userId,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      userId,
      taskId,
      count,
      messages,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

