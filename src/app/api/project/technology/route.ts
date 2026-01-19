import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, design, frontend, backend, database, server, hosting } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const technology = await db.projectTechnology.upsert({
      where: { projectId },
      update: {
        design: design || 'Figma',
        frontend: frontend || 'Next.js',
        backend: backend || 'Next.js',
        database: database || 'Postgres',
        server: server || 'KVM2 -VPS',
        hosting: hosting || 'Local'
      },
      create: {
        projectId,
        design: design || 'Figma',
        frontend: frontend || 'Next.js',
        backend: backend || 'Next.js',
        database: database || 'Postgres',
        server: server || 'KVM2 -VPS',
        hosting: hosting || 'Local'
      }
    });

    return NextResponse.json({
      success: true,
      data: technology
    });

  } catch (error) {
    console.error('Error managing technology:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const technology = await db.projectTechnology.findUnique({
      where: { projectId }
    });

    return NextResponse.json({
      success: true,
      data: technology
    });

  } catch (error) {
    console.error('Error fetching technology:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}