import db from "@/lib/client";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }
        // For non-admin users, return their ratings
        const ratings = await db.performanceRating.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        
        return NextResponse.json({ ratings }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { employeeId, newLearnings, speed, workQuality, leaves, communication, feedback, ratedBy } = body;
        
        if (!employeeId || !ratedBy) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const rating = await db.performanceRating.create({
            data: {
                userId: employeeId,
                newLearnings: parseInt(newLearnings) || 5,
                speed: parseInt(speed) || 5,
                workQuality: parseInt(workQuality) || 5,
                leaves: parseInt(leaves) || 5,
                communication: parseInt(communication) || 5,
                feedback: parseInt(feedback) || 5,
                ratedBy
            }
        });

        return NextResponse.json({ rating }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
    }
}