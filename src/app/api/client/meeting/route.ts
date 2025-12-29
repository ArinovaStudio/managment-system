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

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const requests = await db.meetingRequest.findMany({
      where: user.role === "ADMIN" ? {} : { clientId: userId },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 🔥 Attach meetLink manually
    const meetings = await Promise.all(
      requests.map(async (req) => {
        if (req.status !== "approved") {
          return { ...req, meetLink: null };
        }

        const meeting = await db.meeting.findFirst({
          where: {
            title: req.reason
          },
          select: { meetingLink: true }
        });

        return {
          ...req,
          meetLink: meeting?.meetingLink || null
        };
      })
    );
    

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error("GET meetings error:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const { reason, meetDate, meetTime, duration, projectId } = await req.json();

    if (!reason || !meetDate || !meetTime || !duration) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const meeting = await db.meetingRequest.create({
      data: {
        clientId: userId,
        reason,
        meetDate: new Date(meetDate),
        meetTime,
        duration,
        projectId
      }
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, status, meetLink } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const meetingRequest = await db.meetingRequest.update({
      where: { id },
      data: { status }
    });

    if (status === "approved" && meetLink) {
      // combine date + time into ONE Date object
      const scheduledAt = new Date(
        `${meetingRequest.meetDate.toISOString().split("T")[0]}T${meetingRequest.meetTime}`
      );

      await db.meeting.create({
        data: {
          title: meetingRequest.reason,
          description: "Client meeting request approved",
          scheduledAt,
          meetingLink: meetLink,
          createdById: userId // ADMIN who approved it
        }
      });
    }

    return NextResponse.json({ success: true, meeting: meetingRequest });
  } catch (error) {
    console.error('PATCH meeting error:', error);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
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

    await db.meetingRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}