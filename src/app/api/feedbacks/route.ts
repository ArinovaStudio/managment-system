import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const get_data = await db.feedback.findMany();

    if (get_data.length === 0) {
        return NextResponse.json({ "feedbacks": [] }, { status: 200 })
    }

    return NextResponse.json({ feedbacks: get_data }, { status: 200 })
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
    const { type, rating, desc, isAnynonyms, byName, byEmpId } = await req.json()

    try {
        const save = await db.feedback.create({
            data: {
                type, rating: parseInt(rating), desc, isAnynonyms: Boolean(isAnynonyms), byName, byEmpId
            }
        })
        if (save) {
            return NextResponse.json({ "message": "success", "feedback": save }, { status: 200 })
        }
    }
    catch (e) {
        return NextResponse.json({ "message": "failed", "error": e }, { status: 500 })
    }
}

export async function PUT(req: Request, res: Response) {
    const { type, rating, desc, isAnynonyms, byName, byEmpId, id } = await req.json()

    if (!id) {
        return NextResponse.json({ "error": "Please provide the id" }, { status: 404 })
    }

    try {
        const exist = await db.feedback.findUnique({
            where: { id }
        })
        const save = await db.feedback.update({
            where: {
                id: id
            },
            data: {
               type: type || exist?.type, 
               rating: parseInt(rating) || Number(exist?.rating), 
               desc: desc || exist?.desc, 
               isAnynonyms: Boolean(isAnynonyms) || Boolean(exist?.isAnynonyms), 
               byName: byName || exist?.byName,
               byEmpId: byEmpId || exist?.byEmpId
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