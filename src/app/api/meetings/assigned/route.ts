import db from "@/lib/client";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const token = (await cookies()).get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload: any = verifyToken(token);
        const userId = payload.userId || payload.id;

        const meetings = await db.meetingAttendee.findMany({
            where: { userId },
            include: { meeting: {
                include: {
                    createdBy: {select: {id: true, name: true }}
                }
            }}
        });

        const formatted = meetings.map(m=>({
            id: m.meeting.id,
            title: m.meeting.title,
            description: m.meeting.description,
            scheduledAt: m.meeting.scheduledAt,
            meetingLink: m.meeting.meetingLink,
            createdBy: m.meeting.createdBy.name
        }));

        return NextResponse.json({ success: true, meetings: formatted });
    } catch (error) {
        console.error("FETCH ASSIGNED MEETINGS ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch assigned meetings" }, { status: 500 });
    }
}
