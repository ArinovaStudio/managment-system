import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
    try {
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
        const users = await db.user.findMany(
            {
            where: { role: {
        in: ["EMPLOYEE", "ADMIN"],
        }},
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
