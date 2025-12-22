import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get("userId");
    const client = paramUserId;

    console.log("this is the client", client);


    if (paramUserId) {
        const get_data = await db.ProjectMember.findMany({
            where: {
                userId: client,
            },
            select: {
                userId: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });
console.log(get_data);

        return NextResponse.json({ projects: get_data }, { status: 200 })
    }
}