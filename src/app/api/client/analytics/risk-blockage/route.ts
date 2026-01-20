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

    const tickets = await db.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch risks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, reportedBy, reason, blockedTeammates } = await req.json();

    const ticket = await db.ticket.create({
      data: {
        projectId,
        reportedBy,
        reason,
        blockedTeammates: blockedTeammates || []
      }
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create risk" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.ticket.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Risk deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}