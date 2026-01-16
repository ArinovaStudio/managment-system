import db from "@/lib/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

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
                category: category,
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

export async function PATCH(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = verifyToken(token);
        const userId = payload.userId || payload.id;

        const { amount, action } = await req.json();

        if (action === 'get') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const waterIntake = await db.waterIntake.findFirst({
                where: {
                    userId,
                    date: { gte: today }
                }
            });

            return NextResponse.json({ success: true, amount: waterIntake?.amount || 0 });
        }

        if (action === 'add') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existing = await db.waterIntake.findFirst({
                where: {
                    userId,
                    date: { gte: today }
                }
            });

            let waterIntake;
            if (existing) {
                waterIntake = await db.waterIntake.update({
                    where: { id: existing.id },
                    data: { amount: Math.min(existing.amount + amount, 2000) }
                });
            } else {
                waterIntake = await db.waterIntake.create({
                    data: {
                        userId,
                        amount: Math.min(amount, 2000),
                        date: today
                    }
                });
            }

            return NextResponse.json({ success: true, amount: waterIntake.amount });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("WATER INTAKE ERROR:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}