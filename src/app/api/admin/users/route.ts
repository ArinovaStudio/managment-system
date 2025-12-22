import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
    try {
        // AUTH (who are you?)
        const userId = await getUserId(req);

        // AUTHZ (what can you do?)
        const currentUser = await db.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // 3️ DATA FETCHING
        const users = await db.user.findMany({
            include: {
                timezone: true,
                leaves: true,
                projectMembers: {
                    include: {
                        project: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        for (const user of users) {
            if (!user.leaves) {
                await db.userLeaves.create({
                    data: { userId: user.id }
                });
            }
        }

        return NextResponse.json({ success: true, users });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 401 }
        );
    }
}

const timezones = [
  { code: "IND", name: "India Standard Time", hours: "10AM-5PM", offset: "+05:30", startTime: "10:00", endTime: "17:00" },
  { code: "USA", name: "Eastern Standard Time", hours: "2AM-8PM", offset: "-05:00", startTime: "02:00", endTime: "20:00" },
  { code: "UK",  name: "Greenwich Mean Time", hours: "6PM-1AM", offset: "+00:00", startTime: "18:00", endTime: "01:00" },
];

export async function POST(req: Request) {
  try {
    // AUTH (who is calling)
    const token = (await cookies()).get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    const payload = verifyToken(token) as any;
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // TARGET USER
    const { userId, timezoneCode } = await req.json();
    if (!userId || !timezoneCode) {
      return NextResponse.json(
        { error: "userId and timezoneCode required" },
        { status: 400 }
      );
    }

    const selected = timezones.find(tz => tz.code === timezoneCode);
    if (!selected) {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    // UPDATE TARGET USER (NOT ADMIN)
    const timezone = await db.userTimezone.upsert({
      where: { userId },
      update: selected,
      create: { userId, ...selected },
    });

    return NextResponse.json({ success: true, timezone });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
