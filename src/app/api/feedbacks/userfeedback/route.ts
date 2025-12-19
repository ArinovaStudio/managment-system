import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const getEmployees = searchParams.get('employees');
    const getAll = searchParams.get('all');

    console.log("helooo here i am runningg ");
    
    if (getEmployees === 'true') {
        try {
            const employees = await db.user.findMany({
                select: {
                    id: true,
                    name: true,
                    employeeId: true,
                    email: true,
                    role: true
                }
            });
            
            // Filter out admins if role field exists
            const filteredEmployees = employees.filter(emp => emp.role !== 'ADMIN');
            return NextResponse.json({ employees: filteredEmployees }, { status: 200 });
        } catch (error) {
            console.error('Employee fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
        }
    }

    if (getAll === 'true') {
        const feedbacks = await db.feedback.findMany({
            orderBy: { id: 'desc' }
        });
        return NextResponse.json({ feedbacks }, { status: 200 });
    }

    const userOnly = searchParams.get('userOnly');
    if (userOnly === 'true') {
        try {
            const { getUserId } = await import('@/lib/auth');
            const userId = await getUserId(req);
            console.log("helooo here i am ", userId);
            
            
            const feedbacks = await db.feedback.findMany({
                where: { employeeId: userId },
                orderBy: { id: 'desc' }
            });
            return NextResponse.json({ feedbacks }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ feedbacks: [] }, { status: 200 });
        }
    }

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
    const { type, rating, desc, isAnynonyms, byName, byEmpId, employeeId, isAdminFeedback } = await req.json()

    if (!type || !rating || !desc) {
        return NextResponse.json({ "error": "Missing required fields" }, { status: 400 })
    }

    try {
        const feedbackData: any = {
            type, 
            rating: parseInt(rating), 
            desc, 
            isAnynonyms: Boolean(isAnynonyms), 
            byName: byName || "Unknown", 
            byEmpId: byEmpId || "Unknown",
            ...(employeeId && { employeeId })
        };

        const save = await db.feedback.create({
            data: feedbackData
        })
        
        return NextResponse.json({ "message": "success", "feedback": save }, { status: 200 })
    }
    catch (e) {
        console.error('Feedback creation error:', e);
        return NextResponse.json({ "message": "failed", "error": String(e) }, { status: 500 })
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