import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const get_data = await db.well.findMany();
    
    if (get_data.length === 0) {
        // Add sample data if database is empty
        const sampleTips = [
            {
                id: '1',
                title: 'Take Regular Breaks',
                answer: 'Every 2 hours, take a 5-10 minute break to stretch and rest your eyes. This helps prevent fatigue and improves productivity.',
                likes: 12,
                dislikes: 2
            },
            {
                id: '2', 
                title: 'Stay Hydrated',
                answer: 'Drink at least 8 glasses of water throughout your workday. Proper hydration improves focus and energy levels.',
                likes: 18,
                dislikes: 1
            }
        ];
        return NextResponse.json({"wellBeing": sampleTips}, {status: 200})    
    }

    return NextResponse.json({wellBeing: get_data}, {status: 200})
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
                title, 
                answer,
                likes: 0,
                dislikes: 0
            }
        })
        if (save) {
            return NextResponse.json({"message": "success", "wellBeing": save}, {status: 200})
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
            return NextResponse.json({"message": "success", "wellBeing": save}, {status: 200})
        }
    }

    catch(e) {
        return NextResponse.json({"message": "failed", "error": e}, {status: 500})
    }
}