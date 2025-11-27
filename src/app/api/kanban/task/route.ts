import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/client";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assignee = formData.get("assignee") as string;
    const assigneeAvatar = formData.get("assigneeAvatar") as string;
    const priority = formData.get("priority") as "low" | "medium" | "high";
    const dueDate = formData.get("dueDate") as string;
    const tagsRaw = formData.get("tags") as string;
    const status = formData.get("status") as
      | "assigned"
      | "in-progress"
      | "completed";

    const attachmentFile = formData.get("attachment") as File | null;

    // Validation
    if (!title || !description || !assignee || !priority || !dueDate || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attachments = [];

    // Upload File to Cloudinary (if exists)
    if (attachmentFile && attachmentFile.size > 0) {
      if (attachmentFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File must be under 10MB" },
          { status: 400 }
        );
      }

      // Upload file to Cloudinary using STREAM
      if (attachmentFile && attachmentFile.size > 0) {
        if (attachmentFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "File must be under 10MB" },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await attachmentFile.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "kanban_attachments",
              resource_type: "auto", // allows PDF, DOC, ZIP, IMAGE, etc.
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        attachments.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          size: attachmentFile.size,
          contentType: attachmentFile.type,
          originalName: attachmentFile.name,
        });
      }
    }

    // Tags
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];

    // Save to DB
    const task = await db.task.create({
      data: {
        title,
        description,
        assignee,
        assigneeAvatar,
        priority,
        dueDate: new Date(dueDate),
        tags,
        attachments,
        status,
      },
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR CREATING TASK:", error);
    return NextResponse.json(
      { message: "Failed to create task", error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = await db.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        }
      }
    });

    const formatted = tasks.map((task) => ({
      ...task,
      attachments: task.attachments ?? [],
      comments: task.comments ?? [],
      dueDate: task.dueDate?.toISOString().split("T")[0],
    }));

    return NextResponse.json({ tasks: formatted }, { status: 200 });
  } catch (error) {
    console.error("ERROR FETCHING TASKS:", error);
    return NextResponse.json({ message: "Failed to fetch tasks", error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const deleted = await db.task.deleteMany({});

    return NextResponse.json(
      { message: "Task deleted successfully", deletedTask: deleted },
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