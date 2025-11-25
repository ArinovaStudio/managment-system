import { NextResponse } from "next/server";
import db from "@/lib/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const { taskId, content } = await req.json();

    if (!taskId || !content) {
      return NextResponse.json(
        { error: "taskId and content are required" },
        { status: 400 }
      );
    }

    const comment = await db.comment.create({
      data: {
        content,
        taskId,
        userId,
      }
    });

    // fetch updated task with comments
    const updatedTask = await db.task.findUnique({
      where: { id: taskId },
      include: { comments: true }
    });

    return NextResponse.json({ success: true, comment, updatedTask });
  } catch (err) {
    console.log(err)
    return NextResponse.json({ message: "Server Error", err }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { message: "taskId is required" },
        { status: 400 }
      );
    }

    const comments = await db.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Server error", error },
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