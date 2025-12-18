import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const features = await db.featureRequest.findMany({
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, features });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const { title, description, projectId } = await req.json();

    const feature = await db.featureRequest.create({
      data: {
        clientId: userId,
        title,
        description,
        projectId
      }
    });

    return NextResponse.json({ success: true, feature });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create feature request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const admin = await db.user.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const feature = await db.featureRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, feature });
  } catch (error) {
    console.error("PATCH feature error:", error);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await req.json();

    await db.featureRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
  }
}