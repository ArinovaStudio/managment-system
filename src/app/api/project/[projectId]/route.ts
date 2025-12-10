import db from "@/lib/client";

//overview of a single project
export async function GET(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await ctx.params;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        projectInfo: true
      }
    });

    if (!project) {
      return Response.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        summary: project.summary,
        priority: project.priority,
        status: project.status,            // <-- ADDED
        progress: project.progress,
        createdAt: project.createdAt,      // <-- ADDED
        basicDetails: project.basicDetails,

        // Members
        membersCount: project.members.length,
        members: project.members.map((m) => m.user),

        // Info
        projectInfo: project.projectInfo
      }
    });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to fetch project overview", err },
      { status: 500 }
    );
  }
}
