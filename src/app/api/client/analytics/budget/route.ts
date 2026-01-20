import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");

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

    const projectInfo = await db.projectInfo.findFirst({
      where: whereClause,
      include: {
        Project: {
          select: { name: true, docs: true }
        }
      }
    });

    if (!projectInfo) {
      return NextResponse.json({ success: false, message: "No budget data found" });
    }

    const budgetData = {
      scopeTitle: `${projectInfo.Project.name} - ${projectInfo.projectType}`,
      scopeDate: projectInfo.startDate.toISOString().split('T')[0],
      paymentDate: projectInfo.deadline.toISOString().split('T')[0],
      invoiceName: `Invoice_${projectInfo.Project.name.replace(/\s+/g, '_')}.pdf`,
      paidAmount: Math.floor(projectInfo.budget * 0.6),
      remainingAmount: Math.floor(projectInfo.budget * 0.4),
      totalBudget: projectInfo.budget,
      progress: Math.floor(((Date.now() - projectInfo.startDate.getTime()) / (projectInfo.deadline.getTime() - projectInfo.startDate.getTime())) * 100),
      docs: projectInfo.Project.docs
    };

    return NextResponse.json({ success: true, data: budgetData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch budget data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, budget, clientName, projectType, startDate, deadline, supervisorAdmin } = await req.json();

    const projectInfo = await db.projectInfo.create({
      data: {
        projectId,
        budget,
        clientName,
        projectType,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        supervisorAdmin
      }
    });

    return NextResponse.json({ success: true, data: projectInfo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create budget info" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, budget, projectType, startDate, deadline, supervisorAdmin } = await req.json();

    const projectInfo = await db.projectInfo.update({
      where: { id },
      data: {
        budget,
        projectType,
        startDate: startDate ? new Date(startDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        supervisorAdmin
      }
    });

    return NextResponse.json({ success: true, data: projectInfo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update budget info" }, { status: 500 });
  }
}