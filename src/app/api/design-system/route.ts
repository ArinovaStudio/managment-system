import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const designSystem = await db.designSystem.create({
      data: body,
    });

    return NextResponse.json({ success: true, data: designSystem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create design system" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const designSystem = await db.designSystem.findUnique({
        where: { projectId },
        include: { project: true },
      });
      return NextResponse.json({ success: true, data: designSystem });
    }

    const designSystems = await db.designSystem.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: true },
    });

    return NextResponse.json({ success: true, data: designSystems });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch design systems" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json();
    
    const designSystem = await db.designSystem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: designSystem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update design system" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await db.designSystem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Design system deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to delete design system" }, { status: 500 });
  }
}
