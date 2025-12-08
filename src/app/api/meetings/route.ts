import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admin can create meetings" }, { status: 403 });
    }

    const { title, description, scheduledAt, attendees, meetingLink } = await req.json();

    if (!title || !description || !scheduledAt || !attendees?.length) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (description.length > 150) {
      return NextResponse.json({ error: "Description max 150 chars" }, { status: 400 });
    }

    const meeting = await db.meeting.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        meetingLink,
        createdById: userId,
        attendees: {
          createMany: {
            data: attendees.map((userId: string) => ({ userId }))
          }
        }
      }
    });

    return NextResponse.json({ success: true, meeting });

  } catch (error) {
    console.error("CREATE MEETING ERROR:", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admin allowed" }, { status: 403 });
    }

    const meetings = await db.meeting.findMany({
      orderBy: { scheduledAt: "asc" },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        attendees: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, meetings });

  } catch (error) {
    console.error("FETCH MEETINGS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}
