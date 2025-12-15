import { NextResponse } from "next/server";
import db from "@/lib/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {
  try {
    // ✅ MUST AWAIT cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // ✅ SAFETY CHECK
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { taskId, content } = await req.json();

    if (!taskId || !content) {
      return NextResponse.json(
        { error: "taskId and content are required" },
        { status: 400 }
      );
    }

    // ✅ CORRECT RELATION CONNECT
    const comment = await db.comment.create({
      data: {
        content,
        task: {
          connect: { id: taskId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // ✅ RETURN DATA FRONTEND EXPECTS
    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.user.name,
        avatar: comment.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      },
    });
  } catch (error) {
    console.error("COMMENT POST ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "taskId is required" },
        { status: 400 }
      );
    }

    const comments = await db.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 👇 convert DB data to frontend format
    const formattedComments = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.user?.name || "Unknown",
      avatar: c.user?.name
        ? c.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "?",
    }));

    return NextResponse.json({
      success: true,
      comments: formattedComments,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


export async function DELETE() {
  try {
    const deleted = await db.comment.deleteMany({});

    return NextResponse.json(
      { message: "Comment deleted successfully", deletedTask: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);

    return NextResponse.json(
      { message: "Failed to delete task", error },
      { status: 500 }
    );
  }
}