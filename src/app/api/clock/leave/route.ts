import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);

        let leaves = await db.userLeaves.findUnique({
            where: { userId }
        });

        // Create default leaves if not exists
        if (!leaves) {
            leaves = await db.userLeaves.create({
                data: {
                    userId,
                    remaining: 10,
                    emergency: 10,
                    sick: 10,
                    total: 30
                }
            });
        }

        return NextResponse.json({ success: true, leaves });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to fetch leaves" },
            { status: err.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { action, type, days } = await req.json();
        const userId = await getUserId(req);

        if (action === "deduct") {
            const leaves = await db.userLeaves.findUnique({
                where: { userId }
            });

            if (!leaves) {
                return NextResponse.json({ error: "Leave record not found" }, { status: 404 });
            }

            const updateData: any = {};
            
            if (type === "remaining" && leaves.remaining >= days) {
                updateData.remaining = leaves.remaining - days;
            } else if (type === "emergency" && leaves.emergency >= days) {
                updateData.emergency = leaves.emergency - days;
            } else if (type === "sick" && leaves.sick >= days) {
                updateData.sick = leaves.sick - days;
            } else {
                return NextResponse.json({ error: "Insufficient leave balance" }, { status: 400 });
            }

            const updated = await db.userLeaves.update({
                where: { userId },
                data: updateData
            });

            return NextResponse.json({ success: true, leaves: updated });
        }

        if (action === "reset") {
            const updated = await db.userLeaves.update({
                where: { userId },
                data: {
                    remaining: 10,
                    emergency: 10,
                    sick: 10,
                    total: 30
                }
            });

            return NextResponse.json({ success: true, leaves: updated });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to update leaves" },
            { status: err.message === "Unauthorized" ? 401 : 500 }
        );
    }
}