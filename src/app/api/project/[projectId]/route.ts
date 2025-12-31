import db from "@/lib/client";

//overview of a single project
export async function GET(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await ctx.params;

const project = await db.project.findUnique({
  where: { id: projectId },
  include: {
    members: {
      select: {
        isLeader: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    },
    // repository: true,
    projectInfo: true,
    latestUpdates: {
      orderBy: { createdAt: "desc" },
      take: 3
    }
  }
});


    if (!project) {
      return Response.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Dashboard data structure
    const dashboardData = {
      projectProgress: project.progress || 0,
      latestUpdates: project.latestUpdates.length > 0 ? project.latestUpdates : [
        {
          id: 1,
          title: `Project ${project.name} created`,
          date: new Date(project.createdAt).toLocaleDateString()
        }
      ],
      workDone: [],
      projectInfo: {
        projectName: project.name,
        budget: project.projectInfo?.budget ? `$${project.projectInfo.budget}` : "N/A",
        clientName: project.projectInfo?.clientName || "N/A",
        type: project.projectInfo?.projectType || "N/A",
        startDate: project.projectInfo?.startDate 
          ? new Date(project.projectInfo.startDate).toLocaleDateString() 
          : "N/A",
        deadline: project.projectInfo?.deadline 
          ? new Date(project.projectInfo.deadline).toLocaleDateString() 
          : "N/A"
      },
      documents: []
    };

    return Response.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        isLeader: project.isLeader,
        role: project.role,
        summary: project.summary,
        priority: project.priority,
        repository: project.repository,
        status: project.status,
        progress: project.progress,
        createdAt: project.createdAt,
        basicDetails: project.basicDetails,
        membersCount: project.members.length,
        members: project.members,
        projectInfo: project.projectInfo
      },
      dashboardData
    });
  } catch (err) {
    console.log(err);
    return Response.json(
      { success: false, message: "Failed to fetch project overview", err },
      { status: 500 }
    );
  }
}
