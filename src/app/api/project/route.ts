import db from "@/lib/client"

//create new projects
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, summary, priority, basicDetails, memberIds, budget, projectType, startDate, deadline, supervisorAdmin, clientName } = body;

    if (!name || !priority) {
      return Response.json(
        { success: false, message: "Name and priority are required" },
        { status: 400 }
      );
    }

    // Create project with project info
    const project = await db.project.create({
      data: {
        name,
        summary,
        priority,
        basicDetails,
        projectInfo: {
          create: {
            budget,
            projectType,
            startDate: new Date(startDate),
            deadline: new Date(deadline),
            supervisorAdmin,
            clientName
          }
        }
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
        progress: up.project.progress,
        createdAt: up.project.createdAt
      }));

      return Response.json({ success: true, projects });
    }
    
    // Get all projects (admin view)
    const projects = await db.project.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
      summary: p.summary,
      priority: p.priority,
      basicDetails: p.basicDetails,
      membersCount: p._count.members,
      progress: p.progress,
      createdAt: p.createdAt
    }));

    return Response.json({ success: true, projects: formattedProjects });
  } catch (err) {
    return Response.json(
      { success: false, message: "Failed to fetch projects", err },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return Response.json(
      { success: false, message: "Project ID is required" },
      { status: 400 }
    );
  }

  const del = await db.project.deleteMany({
    where: { id: projectId }
  })
  return Response.json({ success: true, message: "Project deleted successfully" }, { status: 200 });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { projectId, name, summary, priority, basicDetails, budget, projectType, startDate, deadline, supervisorAdmin } = body;

    if (!projectId) {
      return Response.json({
        success: false,
        message: "Project ID is required"
      }, { status: 400 });
    }

    const updateProject = await db.project.update({
      where: { id: projectId },
      data: {
        name,
        summary,
        priority,
        basicDetails,
        projectInfo: {
          update: {
            budget,
            projectType,
            startDate: new Date(startDate),
            deadline: new Date(deadline),
            supervisorAdmin,
          }
        }
      }
    })

    return Response.json({
      success: true,
      message: "Project updated successfully",
      project: updateProject
    });
  }
  catch (error) {
    return Response.json({
      success: false,
      message: "Failed",
      error: error
    })
  }
}