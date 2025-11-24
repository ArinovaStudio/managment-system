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

    return NextResponse.json({ success: true, comment });
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
