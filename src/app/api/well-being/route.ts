import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const get_data = await db.well.findMany();
    
    if (get_data.length > 0) {
        return NextResponse.json({"error": "no data found"}, {status: 401})    
    }

    return NextResponse.json({data: get_data}, {status: 200})
}

export async function DELETE(req: Request, res: Response) {
    const {id} = await req.json()

    if (!id) {
        return NextResponse.json({"error": "Please provide the id"}, {status: 404})    
    }
    const del = await db.well.delete({where: {id: id}})
    if (del) return NextResponse.json({"message": "success"}, {status: 200})
}

export async function POST(req: Request, res: Response) {
    const {title, answer} = await req.json()

    try {
        const save = await db.well.create({
            data: {
                title, answer
            }
        })
        if (save) {
            return NextResponse.json({"message": "success", "data": save}, {status: 200})
        }
    }
    catch(e) {
            return NextResponse.json({"message": "failed", "error": e}, {status: 500})
    }
}

export async function PUT(req: Request, res: Response) {
    const {title, answer, id} = await req.json()

    if (!id) {
        return NextResponse.json({"error": "Please provide the id"}, {status: 404})    
    }

    try {
        const exist = await db.well.findUnique({
            where: {id}
        })
        const save = await db.well.update({
            where: {
                id: id
            },
            data: {
                title: title || exist?.title, 
                answer: answer || exist?.answer
            }
        })
        if (save) {
            return NextResponse.json({"message": "success", "data": save}, {status: 200})
        }
    }

    catch(e) {
        return NextResponse.json({"message": "failed", "error": e}, {status: 500})
    }
}