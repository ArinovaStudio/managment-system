import db from "@/lib/client";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        
        // If admin, return employees list
        if (user?.role === 'ADMIN') {
            const employees = await db.user.findMany({
                where: { role: { not: 'ADMIN' } },
                select: {
                    id: true,
                    name: true,
                    employeeId: true,
                    email: true
                }
            });
            return NextResponse.json({ employees }, { status: 200 });
        }
        
        // For non-admin users, return their ratings
        const ratings = await db.performanceRating.findMany({
            where: { employeeId: userId },
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
                employeeId,
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