import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/client";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assignee = formData.get("assignee") as string;
    const employeeId = formData.get("employeeId") as string;
    const assigneeAvatar = formData.get("assigneeAvatar") as string;
    const priority = (formData.get("priority") as string)?.trim();
    const dueDate = formData.get("dueDate") as string;
    const tagsRaw = formData.get("tags") as string;
    const status = (formData.get("status") as string)?.trim();
    const projectId = formData.get("projectId") as string | null;
    const attachmentFile = formData.get("attachment") as File | null;

    if (!title || !description || !assignee || !priority || !dueDate || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attachments: any[] = [];

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
            resource_type: "auto",
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

    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];

    const task = await db.task.create({
      data: {
        title,
        description,
        assignee,
        employeeId,
        assigneeAvatar,
        priority,
        dueDate: new Date(dueDate),
        tags,
        attachments,
        status,
        ...(projectId && { projectId }),
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


// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const projectId = searchParams.get("projectId");
//     const assignee = searchParams.get("assignee");

//     const tasks = await db.task.findMany({
//       where: {
//         ...(projectId && { projectId }),
//         ...(assignee && { assignee })
//       },
//       orderBy: { createdAt: "desc" },
//     });


//     const formatted = tasks.map((task) => ({
//       ...task,
//       attachments: task.attachments ?? [],
//       comments: task.comments ?? [],
//       dueDate: task.dueDate?.toISOString().split("T")[0],
//     }));

//     return NextResponse.json({ tasks: formatted }, { status: 200 });
//   } catch (error) {
//     console.error("ERROR FETCHING TASKS:", error);
//     return NextResponse.json({ message: "Failed to fetch tasks", error }, { status: 500 });
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const { id, status } = await req.json();

//     if (!id || !status) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const updatedTask = await db.task.update({
//       where: { id },
//       data: { status },
//     });

//     return NextResponse.json({ success: true, task: updatedTask });
//   } catch (error) {
//     console.error("Error updating task:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;


    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;


    const userId = decoded.userId;
    const userName = decoded.Name;
    const userRole = decoded.role; // ADMIN | EMPLOYEE

    if (!userId || !userRole) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("this is my ", userId);


    const userr = await db.user.findUnique({
      where: {
        id: userId,
      },
    })
    console.log("this is my empid ", userr.employeeId);

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const employeeIdFromQuery = searchParams.get("employeeId");

    console.log(employeeIdFromQuery);


    let whereClause: any = {
      ...(projectId && { projectId }),
    };

    if (userRole === "ADMIN") {
      // Admin explicitly selects an employee
      if (employeeIdFromQuery) {
        whereClause.employeeId = employeeIdFromQuery;
      } else {
        // First load → admin sees only own tasks
        whereClause.employeeId = employeeIdFromQuery || userName;
      }
    } else {
      // Employee → always self
      whereClause.employeeId = employeeIdFromQuery || userr.employeeId;
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    console.log(tasks);
    console.log(whereClause);



    return NextResponse.json(
      { success: true, tasks },
      { status: 200 }
    );
  } catch (error) {
    console.error("TASK FETCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}



export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let id: string;
    let data: any = {};

    if (contentType.includes("application/json")) {
      // Drag & drop (status only)
      const body = await req.json();
      id = body.id;
      data.status = body.status;
    } else {
      // Edit task modal (full update)
      const formData = await req.formData();

      id = formData.get("id") as string;

      data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        assignee: formData.get("assignee") as string,
        priority: formData.get("priority") as string,
        status: formData.get("status") as string,
        dueDate: new Date(formData.get("dueDate") as string),
        tags: (formData.get("tags") as string)
          ?.split(",")
          .map(t => t.trim()),
      };
    }

    if (!id) {
      return NextResponse.json(
        { error: "Task ID missing" },
        { status: 400 }
      );
    }

    const updatedTask = await db.task.update({
      where: { id },
      data,
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



export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Task ID is required" },
        { status: 400 }
      );
    }

    const deletedTask = await db.task.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Task deleted successfully",
        task: deletedTask,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting task:", error);

    // Prisma record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
