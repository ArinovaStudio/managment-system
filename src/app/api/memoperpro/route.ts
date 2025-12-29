import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/client";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
        }


        const memo = await db.memo.findUnique({
            where: {
                id: id
            },
            include: {
                meetingRequest: {
                    include: {
                        project: true,
                    },
                },
            }
        });

        return NextResponse.json({ success: true, memo });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch memos" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const { message } = await req.json();

        if (!id || !message) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        await db.memo.update({
            where: { id: id },
            data: { message: message },
        });

        return NextResponse.json({ success: true });
    }catch (error) {
        return NextResponse.json({ "message": "failed", "error": error }, { status: 500 })
    }
}