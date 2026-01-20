import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    let whereClause = {};
    
    if (projectId) {
      whereClause = { projectId };
    } else if (clientId) {
      const projects = await db.project.findMany({
        where: {
          OR: [
            { projectInfo: { clientName: clientId } },
            { members: { some: { userId: clientId } } }
          ]
        },
        select: { id: true }
      });
      const projectIds = projects.map(p => p.id);
      whereClause = { projectId: { in: projectIds } };
    }

    const milestones = await db.milestone.findMany({
      where: whereClause,
      orderBy: { dueDate: "asc" },
      include: {
        project: { select: { name: true } },
        creator: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: milestones });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, title, description, dueDate, createdBy } = await req.json();

    const milestone = await db.milestone.create({
      data: {
        projectId,
        title,
        description,
        dueDate: new Date(dueDate),
        createdBy
      }
    });

    return NextResponse.json({ success: true, data: milestone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create milestone" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, description, dueDate, status } = await req.json();

    const milestone = await db.milestone.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status
      }
    });

    return NextResponse.json({ success: true, data: milestone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.milestone.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}