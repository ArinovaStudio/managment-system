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
      whereClause = { clientId };
    }
    

    const risks = await db.riskBlockage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    

    return NextResponse.json({ success: true, data: risks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch risks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, clientId, riskTitle } = await req.json();

    const risk = await db.riskBlockage.create({
      data: {
        projectId,
        clientId,
        riskTitle
      }
    });

    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to create risk" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.riskBlockage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Risk deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, riskTitle } = await req.json();

    const risk = await db.riskBlockage.update({
      where: { id },
      data: { riskTitle }
    });

    return NextResponse.json({ success: true, data: risk });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update risk" }, { status: 500 });
  }
}