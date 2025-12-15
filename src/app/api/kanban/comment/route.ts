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



// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const taskId = searchParams.get("taskId");

//     if (!taskId) {
//       return NextResponse.json(
//         { success: false, message: "taskId is required" },
//         { status: 400 }
//       );
//     }

//     const comments = await db.comment.findMany({
//       where: { taskId },
//       orderBy: { createdAt: "asc" },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     // 👇 convert DB data to frontend format
//     const formattedComments = comments.map((c) => ({
//       id: c.id,
//       content: c.content,
//       createdAt: c.createdAt,
//       author: c.user?.name || "Unknown",
//       avatar: c.user?.name
//         ? c.user.name
//             .split(" ")
//             .map((n) => n[0])
//             .join("")
//             .toUpperCase()
//         : "?",
//     }));

//     return NextResponse.json({
//       success: true,
//       comments: formattedComments,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
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

    // 🔁 Normalize data for frontend
    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      userId: c.userId,
      authorId: c.userId,
      author: c.user?.name || "Unknown",
      avatar: c.user?.name
        ? c.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "?",
    }));

    return NextResponse.json({ success: true, comments: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(req: Request) {
  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required" },
        { status: 400 }
      );
    }

    const deleted = await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { success: true, message: "Comment deleted successfully", deleted },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE_COMMENT_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete comment",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const { commentId, content } = await req.json();

    if (!commentId || !content) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await db.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return NextResponse.json({ success: true }); // ✅ REQUIRED
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
