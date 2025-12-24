import { NextResponse } from "next/server";
import db from "@/lib/client";

export async function GET() {
    try {
        const memos = await db.memo.findMany({
            include: {
                meetingRequest: {
                    include: {
                        project: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(memos);

        return NextResponse.json({ success: true, memos });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch memos" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        console.log(id);
        

        if (!id) {
            return NextResponse.json({ "error": "Please provide the id" }, { status: 404 })
        }
        const del = await db.memo.delete({ where: { id: id } })
        if (del) return NextResponse.json({ "message": "success" }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete memo" },
            { status: 500 }
        );
    }
}
