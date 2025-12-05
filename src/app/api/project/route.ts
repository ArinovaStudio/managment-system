import db from "@/lib/client"

//create new projects
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, summary, priority, basicDetails, memberIds } = body;

    if (!name || !priority) {
      return Response.json(
        { success: false, message: "Name and priority are required" },
        { status: 400 }
      );
    }

    // Create project
    const project = await db.project.create({
      data: {
        name,
        summary,
        priority,
        basicDetails,
      },
    });

    // If memberIds are provided — link members to project
    if (memberIds && Array.isArray(memberIds)) {
      const createMembers = memberIds.map((uid: string) => ({
        projectId: project.id,
        userId: uid,
      }));

      await db.projectMember.createMany({
        data: createMembers,
      });
    }

    return Response.json(
      {
        success: true,
        message: "Project created successfully",
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error)
    return Response.json(
      { success: false, message: "Failed to create project",error },
      { status: 500 }
    );
  }
}

//get all projects or user projects
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userOnly = searchParams.get('userOnly');
    
    if (userOnly === 'true') {
      // Get projects for current user
      const { getUserId } = await import('@/lib/auth');
      const userId = await getUserId(req);
      
      const userProjects = await db.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              _count: {
                select: { members: true }
              }
            }
          }
        }
      });

      const projects = userProjects.map(up => ({
        id: up.project.id,
        name: up.project.name,
        summary: up.project.summary,
        priority: up.project.priority,
        basicDetails: up.project.basicDetails,
        membersCount: up.project._count.members,
        createdAt: up.project.createdAt
      }));

      return Response.json({ success: true, projects });
    }
    
    // Get all projects (admin view)
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, projects });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to fetch projects", err },
      { status: 500 }
    );
  }
}

