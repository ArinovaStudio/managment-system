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
      // Get projects where client is involved
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

    const updates = await db.latestUpdate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch updates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, date, projectId, createdBy } = await req.json();

    const update = await db.latestUpdate.create({
      data: {
        title,
        date,
        projectId,
        createdBy
      }
    });

    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create update" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, date } = await req.json();

    const update = await db.latestUpdate.update({
      where: { id },
      data: { title, date }
    });

    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.latestUpdate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Update deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}