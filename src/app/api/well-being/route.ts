import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
    const get_data = await db.well.findMany();
    

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
    const {title, answer, description, category} = await req.json()

    try {
        const save = await db.well.create({
            data: {
                title, 
                answer: answer || description,
                category,
                likes: 0,
                dislikes: 0
            }
        })
        if (save) {
            return NextResponse.json({"message": "success", "wellBeing": save}, {status: 200})
        }
    }
    catch(e) {
        console.log(e.message);
        
            return NextResponse.json({"message": "failed", "error": e}, {status: 500})
    }
}

export async function PUT(req: Request, res: Response) {
    const {title, answer, id, voteType, currentLikes, currentDislikes} = await req.json()

    if (!id) {
        return NextResponse.json({"error": "Please provide the id"}, {status: 404})    
    }

    try {
        const exist = await db.well.findUnique({
            where: {id}
        })
        
        let updateData: any = {};
        
        // Handle voting
        if (voteType) {
            if (voteType === 'like') {
                updateData.likes = (currentLikes || 0) + 1;
            } else if (voteType === 'dislike') {
                updateData.dislikes = (currentDislikes || 0) + 1;
            }
        } else {
            // Handle regular updates
            updateData = {
                title: title || exist?.title, 
                answer: answer || exist?.answer
            };
        }
        
        const save = await db.well.update({
            where: { id },
            data: updateData
        })
        
        return NextResponse.json({"message": "success", "wellBeing": save}, {status: 200})
    }
    catch(e) {
        return NextResponse.json({"message": "failed", "error": e}, {status: 500})
    }
}