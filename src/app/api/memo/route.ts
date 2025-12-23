import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get("meetingId");

        if (!meetingId) {
            return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
        }

        const meeting = await db.meetingRequest.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, meeting });

    } catch (error) {
        return NextResponse.json({ error: "Failed to get meeting" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = (await cookies()).get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = verifyToken(token);
        const userId = payload.userId || payload.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { meetingId, memo, totaltime } = await req.json();

        if (!meetingId || !memo) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const memoo = await db.memo.create({
            data: { 
                meetingId,
                message: memo,
                clientId: userId,
                totaltime:totaltime
            }
        });

        console.log("this is memo", memoo);
        

        return NextResponse.json({
            success: true,
            memoo
        })
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
    }
}