import db from '@/lib/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const projectId = searchParams.get('projectId');

    if (!clientId || !projectId) {
      return NextResponse.json(
        { error: 'Client ID and Project ID are required' },
        { status: 400 }
      );
    }

    // Get specific project with all related data
    const projectMember = await db.projectMember.findFirst({
      where: {
        userId: clientId,
        projectId: projectId
      },
      include: {
        project: {
          include: {
            projectInfo: true,
            milestones: {
              orderBy: {
                createdAt: 'asc'
              }
            },
            members: {
              where: {
                isLeader: true
              },
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!projectMember) {
      return NextResponse.json(
        { error: 'Project not found for this client' },
        { status: 404 }
      );
    }

    const project = projectMember.project;
    const projectInfo = project.projectInfo;

    // Get project manager from supervisorAdmin or fallback to team leader
    let projectManager = 'Not Assigned';
    if (projectInfo?.supervisorAdmin) {
      // Fetch supervisor name by ID
      const supervisor = await db.user.findUnique({
        where: { id: projectInfo.supervisorAdmin },
        select: { name: true }
      });
      projectManager = supervisor?.name || 'Not Assigned';
    } else if (project.members[0]?.user?.name) {
      projectManager = project.members[0].user.name;
    }

    // Calculate progress phases based on milestones
    const milestones = project.milestones;
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;

    // Define phase structure
    const phases = [
      { name: "Planning", color: "#3b82f6" },
      { name: "Development", color: "#3b82f6" },
      { name: "Testing", color: "#3b82f6" },
      { name: "Deployment", color: "#3b82f6" },
      { name: "Maintenance", color: "#3b82f6" }
    ];

    // Calculate phase percentages based on project progress
    const overallProgress = project.progress || 0;
    const phaseProgress = phases.map((phase, index) => {
      const basePercentage = 100 / phases.length;
      let percentage = basePercentage;
      let completed = false;

      // Adjust based on overall progress
      if (overallProgress >= (index + 1) * 20) {
        completed = true;
      } else if (overallProgress > index * 20) {
        percentage = (overallProgress - (index * 20)) / 20 * basePercentage;
      } else {
        percentage = 0;
      }

      return {
        ...phase,
        percentage: Math.round(percentage * 10) / 10,
        completed
      };
    });

    // Calculate duration
    const startDate = projectInfo?.startDate;
    const deadline = projectInfo?.deadline;
    let totalDuration = 0;
    let durationUnit = 'Days';

    if (startDate && deadline) {
      const diffTime = Math.abs(new Date(deadline).getTime() - new Date(startDate).getTime());
      totalDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const projectOverview = {
      project: {
        name: project.name,
        type: projectInfo?.projectType || 'Custom Management',
        budget: projectInfo?.budget || 0,
        currency: 'INR',
        description: project.summary || project.basicDetails || 'No description available'
      },
      timeline: {
        startDate: projectInfo?.startDate?.toISOString() || new Date().toISOString(),
        deadline: projectInfo?.deadline?.toISOString() || new Date().toISOString(),
        totalDuration,
        durationUnit
      },
      team: {
        projectManager
      },
      progress: {
        overall: overallProgress,
        phases: phaseProgress
      }
    };

    return NextResponse.json({
      success: true,
      data: projectOverview
    });

  } catch (error) {
    console.error('Error fetching client overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}