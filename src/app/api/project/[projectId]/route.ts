import db from "@/lib/client";

//overview of a single project
export async function GET(req: Request, { params }: any) {
  try {
    const projectId = params.projectId;

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
        }
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
        basicDetails: project.basicDetails,
        membersCount: project.members.length,
        members: project.members.map((m) => m.user)
      }
    });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to fetch project overview",err },
      { status: 500 }
    );
  }
}