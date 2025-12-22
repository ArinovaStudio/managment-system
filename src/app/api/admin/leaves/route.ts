import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function POST(req: Request) {
    try {
        // 🔐 AUTH (admin only)
        const token = (await cookies()).get("token")?.value;
        if (!token) throw new Error("Unauthorized");

        const payload = verifyToken(token) as any;
        if (payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 🎯 TARGET USER
        const { userId, action, type, days } = await req.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        let leaves = await db.userLeaves.findUnique({ where: { userId } });

        // Auto-create if missing
        if (!leaves) {
            leaves = await db.userLeaves.create({
                data: {
                    userId,
                    remaining: 8,
                    emergency: 3,
                    sick: 5,
                    total: 16,
                },
            });
        }

        // 🔽 DEDUCT
        if (action === "deduct") {
            if (!type || !days) {
                return NextResponse.json({ error: "Missing type or days" }, { status: 400 });
            }

            if (!["remaining", "sick", "emergency"].includes(type)) {
                return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
            }

            if (leaves[type] < days) {
                return NextResponse.json({ error: "Insufficient leave balance" }, { status: 400 });
            }

            if (leaves.total < days) {
                return NextResponse.json({ error: "Total leave exhausted" }, { status: 400 });
            }

            const updated = await db.userLeaves.update({
                where: { userId },
                data: {
                    [type]: leaves[type] - days,
                    total: leaves.total - days, // ✅ MAIN FIX
                },
            });

            return NextResponse.json({ success: true, leaves: updated });
        }


        // 🔄 RESET
        if (action === "reset") {
            const updated = await db.userLeaves.update({
                where: { userId },
                data: {
                    remaining: 8,
                    emergency: 3,
                    sick: 5,
                    total: 16,
                },
            });

            return NextResponse.json({ success: true, leaves: updated });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: err.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
