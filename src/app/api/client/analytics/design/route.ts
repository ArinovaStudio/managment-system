import db from '@/lib/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 });
        }
        // Get client's project with design system data
        const clientProjects = await db.projectMember.findMany({
            where: { userId: clientId },
            include: {
                project: {
                    include: {
                        designSystem: true,
                        projectTechnology: true,
                        projectInfo: true,
                        milestones: {
                            orderBy: { createdAt: "asc" }
                        }
                    }
                }
            }
        });

        if (!clientProjects.length) {
            return NextResponse.json(
                { error: 'No projects found for this client' },
                { status: 404 }
            );
        }

        const project = clientProjects[0].project;
        const designSystem = project.designSystem;
        const projectTechnology = project.projectTechnology;
        const projectInfo = project.projectInfo;
        const milestones = project.milestones;

        // Calculate days remaining
        let daysRemaining = 0;
        if (projectInfo?.deadline) {
            const today = new Date();
            const deadline = new Date(projectInfo.deadline);
            const diffTime = deadline.getTime() - today.getTime();
            daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        // Get current phase from project
        const currentPhase = project?.currentPhase ?? "Design";

        // Calculate phase completion (for UI display only)
        const phases = [
            { name: 'Design', icon: 'palette', completed: currentPhase === 'Design' || ['Code', 'Testing', 'Deployment'].includes(currentPhase) },
            { name: 'Code', icon: 'code', completed: currentPhase === 'Code' || ['Testing', 'Deployment'].includes(currentPhase) },
            { name: 'Testing', icon: 'test', completed: currentPhase === 'Testing' || currentPhase === 'Deployment' },
            { name: 'Deployment', icon: 'deploy', completed: currentPhase === 'Deployment' }
        ];

        const designData = {
            // All DesignSystem fields
            id: designSystem?.id || null,
            projectId: designSystem?.projectId || null,
            brandName: designSystem?.brandName || 'Not set',
            colors: designSystem?.colors || ['null'],
            fonts: designSystem?.fonts || {},
            designType: designSystem?.designType || ['null'],
            layoutStyle: designSystem?.layoutStyle || {},
            contentTone: designSystem?.contentTone || ['null'],
            visualGuidelines: designSystem?.visualGuidelines || {},
            theme: designSystem?.theme || ['null'],
            brandFeel: designSystem?.brandFeel || 'null',
            keyPages: designSystem?.keyPages || ['null'],
            uniqueness: designSystem?.uniqueness || {},
            createdAt: designSystem?.createdAt || null,
            updatedAt: designSystem?.updatedAt || null,
            projectPhase: {
                current: currentPhase,
                daysRemaining,
                phases
            },
            technology: projectTechnology?.tech || []
        };

        return NextResponse.json({
            success: true,
            data: designData
        });

    } catch (error) {
        console.error('Error fetching design data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await db.$disconnect();
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { clientId, projectId, currentPhase } = await request.json();

        if (!clientId || !projectId || !currentPhase) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update only the current phase
        await db.project.update({
            where: { id: projectId },
            data: { currentPhase }
        });

        return NextResponse.json({
            success: true,
            message: 'Project phase updated successfully'
        });

    } catch (error) {
        console.error('Error updating project phase:', error);
        return NextResponse.json(
            { error: 'Failed to update project phase' },
            { status: 500 }
        );
    } finally {
        await db.$disconnect();
    }
}