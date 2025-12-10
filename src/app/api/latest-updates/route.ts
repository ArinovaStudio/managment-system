import { NextResponse } from "next/server";
import db from "@/lib/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID required" },
        { status: 400 }
      );
    }

    const updates = await db.latestUpdate.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, projectId, createdBy } = await req.json();

    if (!title || !projectId || !createdBy) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const update = await db.latestUpdate.create({
      data: {
        title,
        projectId,
        createdBy,
        date: new Date().toLocaleDateString()
      }
    });

    return NextResponse.json({ success: true, update });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create update" },
      { status: 500 }
    );
  }
}