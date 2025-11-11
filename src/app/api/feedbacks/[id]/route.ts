import db from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params: { id: string } }) {
    const get_data = await db.feedback.findMany({
        where: {
            id: params.id
        }
    });

    if (get_data.length > 0) {
        return NextResponse.json({ "error": "no data found" }, { status: 401 })
    }

    return NextResponse.json({ data: get_data }, { status: 200 })
}