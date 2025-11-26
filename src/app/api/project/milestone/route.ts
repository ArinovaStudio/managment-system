import db from "@/lib/client";

export async function POST(req: Request) {
  try {
    const { projectId, title, description, dueDate, adminId } = await req.json();

    if (!projectId || !title || !dueDate || !adminId) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Optional → Verify admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Only admins can create milestones" },
        { status: 403 }
      );
    }

    const milestone = await db.milestone.create({
      data: {
        projectId,
        title,
        description,
        dueDate: new Date(dueDate),
        createdBy: adminId,
      },
    });

    return Response.json({ success: true, milestone });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Failed to create milestone",error },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return Response.json(
        { success: false, message: "projectId required" },
        { status: 400 }
      );
    }

    const milestones = await db.milestone.findMany({
      where: { projectId },
      orderBy: { dueDate: "asc" }
    });

    return Response.json({ success: true, milestones });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Failed to fetch milestones",error },
      { status: 500 }
    );
  }
}
