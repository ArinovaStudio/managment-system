import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get("userId");
    const getAll = searchParams.get('all');
    const client = paramUserId;

    if (paramUserId) {
        const get_data = await db.clientfeedback.findMany({
            where: {
                userId: client
            },
            orderBy: {
                id: 'desc',
            },
        });
        return NextResponse.json({ feedbacks: get_data }, { status: 200 })
    }

    if (getAll === 'true') {

        const feedbacks = await db.clientfeedback.findMany({
            orderBy: { id: 'desc' }
        });

        return NextResponse.json({ feedbacks }, { status: 200 });
    }
}

export async function DELETE(req: Request, res: Response) {
    const { id } = await req.json()

    if (!id) {
        return NextResponse.json({ "error": "Please provide the id" }, { status: 404 })
    }
    const del = await db.feedback.delete({ where: { id: id } })
    if (del) return NextResponse.json({ "message": "success" }, { status: 200 })
}

export async function POST(req: Request, res: Response) {
    const { type, message, byName, userId, project } = await req.json()

    if (!type || !message) {
        return NextResponse.json({ "error": "Missing required fields" }, { status: 400 })
    }

    try {
        const feedbackData: any = {
            type,
            message,
            byName: byName || "Unknown",
            userId: userId,
            project: project
        };

        const save = await db.clientfeedback.create({
            data: feedbackData
        })

        return NextResponse.json({ "message": "success", "feedback": save }, { status: 200 })
    }
    catch (e) {
        console.error('Feedback creation error:', e.message);
        return NextResponse.json({ "message": "failed", "error": String(e) }, { status: 500 })
    }
}

export async function PUT(req: Request, res: Response) {
    const { type, message, byName, userId, project } = await req.json()

    if (!userId) {
        return NextResponse.json({ "error": "Please provide the id" }, { status: 404 })
    }

    try {
        const exist = await db.feedback.findUnique({
            where: { userId }
        })
        const save = await db.feedback.update({
            where: {
                id: userId
            },
            data: {
                type: type || exist?.type,
                desc: message || exist?.message,
                byName: byName || exist?.byName,
                project: project || exist?.project
            }
        })
        if (save) {
            return NextResponse.json({ "message": "success", "data": save }, { status: 200 })
        }
    }

    catch (e) {
        return NextResponse.json({ "message": "failed", "error": e }, { status: 500 })
    }
}