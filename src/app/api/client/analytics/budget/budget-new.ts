import db from "@/lib/client";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");

    let whereClause: any = {};

    if (projectId) {
      whereClause = { projectId };
    } else if (clientId) {
      const projects = await db.project.findMany({
        where: {
          members: {
            some: {
              userId: clientId,
              user: { role: "CLIENT" }
            }
          }
        },
        select: { id: true }
      });

      const projectIds = projects.map(p => p.id);
      if (projectIds.length === 0)
        return NextResponse.json({ success: false, message: "No projects found" });

      whereClause = { projectId: { in: projectIds } };
    }

    const projectInfo = await db.projectInfo.findFirst({
      where: whereClause,
      include: {
        Project: {
          select: {
            name: true,
            progress: true,
            docs: true
          }
        }
      }
    });

    if (!projectInfo)
      return NextResponse.json({ success: false, message: "No budget info" });

    const progress = projectInfo.Project.progress ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        scopeTitle: `${projectInfo.Project.name} - ${projectInfo.projectType}`,
        scopeDate: projectInfo.startDate.toISOString().split("T")[0],
        paymentDate: projectInfo.deadline.toISOString().split("T")[0],
        paidAmount: projectInfo.paidAmount ?? 0,
        remainingAmount: projectInfo.budget - (projectInfo.paidAmount ?? 0),
        totalBudget: projectInfo.budget,
        progress,
        remainingProgress: 100 - progress,
        docs: projectInfo.Project.docs,
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, budget, clientName, projectType, startDate, deadline, supervisorAdmin } = await req.json();

    const projectInfo = await db.projectInfo.create({
      data: {
        projectId,
        budget,
        paidAmount: 0,
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
    const formData = await req.formData();
    const clientId = formData.get("clientId") as string;
    const paidAmount = Number(formData.get("paidAmount"));
    const totalBudget = Number(formData.get("totalBudget"));

    const latestInvoice = formData.get("latestInvoice") as File | null;
    const scopeTitle = formData.get("scopeTitle") as File | null;

    const paymentHistoryFiles: File[] = [];
    let i = 0;
    while (formData.get(`paymentHistory_${i}`)) {
      paymentHistoryFiles.push(formData.get(`paymentHistory_${i}`) as File);
      i++;
    }

    // Get all client projects
    const projects = await db.project.findMany({
      where: {
        members: {
          some: { userId: clientId, user: { role: "CLIENT" } }
        }
      },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);

    await db.projectInfo.updateMany({
      where: { projectId: { in: projectIds } },
      data: { budget: totalBudget, paidAmount }
    });

    for (const project of projectIds) {
      const docsToSave = [];

      if (latestInvoice) {
        const buffer = Buffer.from(await latestInvoice.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });

        docsToSave.push({
          title: `Invoice - ${latestInvoice.name}`,
          fileUrl: (uploadResult as any).secure_url,
          projectId: project,
          userId: clientId,
        });
      }

      if (scopeTitle) {
        const buffer = Buffer.from(await scopeTitle.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });

        docsToSave.push({
          title: `Scope - ${scopeTitle.name}`,
          fileUrl: (uploadResult as any).secure_url,
          projectId: project,
          userId: clientId,
        });
      }

      for (const f of paymentHistoryFiles) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });

        docsToSave.push({
          title: `Payment History - ${f.name}`,
          fileUrl: (uploadResult as any).secure_url,
          projectId: project,
          userId: clientId,
        });
      }

      if (docsToSave.length > 0) {
        await db.docs.createMany({ data: docsToSave });
      }
    }

    return NextResponse.json({ success: true, message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}