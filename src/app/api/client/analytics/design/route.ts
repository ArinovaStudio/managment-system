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
            where: {
                userId: clientId
            },
            include: {
                project: {
                    include: {
                        designSystem: true,
                        projectTechnology: true,
                        projectInfo: true,
                        milestones: {
                            orderBy: {
                                createdAt: 'asc'
                            }
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

        // Determine current phase based on project progress
        const progress = project.progress || 0;
        let currentPhase = 'Design';
        if (progress >= 75) currentPhase = 'Deployment';
        else if (progress >= 50) currentPhase = 'Testing';
        else if (progress >= 25) currentPhase = 'Code';

        // Calculate phase completion
        const phases = [
            { name: 'Design', icon: 'palette', completed: progress >= 25 },
            { name: 'Code', icon: 'code', completed: progress >= 50 },
            { name: 'Testing', icon: 'test', completed: progress >= 75 },
            { name: 'Deployment', icon: 'deploy', completed: progress >= 100 }
        ];

        const designData = {
            colors: designSystem?.colors || ['null'],
            designType: designSystem?.designType || ['null'],
            brandFeel: designSystem?.brandFeel || 'null',
            contentTone: designSystem?.contentTone || ['null'],
            fonts: designSystem?.fonts || {},
            projectPhase: {
                current: currentPhase,
                daysRemaining,
                phases
            },
            technology: {
                design: projectTechnology?.design || 'null',
                frontend: projectTechnology?.frontend || 'null',
                backend: projectTechnology?.backend || 'null',
                database: projectTechnology?.database || 'null',
                server: projectTechnology?.server || 'null',
                hosting: projectTechnology?.hosting || 'null'
            }
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