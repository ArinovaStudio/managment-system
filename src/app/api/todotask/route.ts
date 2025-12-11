import db from "@/lib/client";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        
        const tasks = await db.todoTask.findMany({
            where: { 
                userId,
                completed: false
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        const { title, description } = await req.json();
        
        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        
        const task = await db.todoTask.create({
            data: {
                title,
                description: description || '',
                userId
            }
        });
        
        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = await getUserId(req);
        const { taskId } = await req.json();
        
        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }
        
        const task = await db.todoTask.update({
            where: { 
                id: taskId,
                userId
            },
            data: { completed: true }
        });
        
        return NextResponse.json({ task }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUserId(req);
        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get('taskId');
        
        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }
        
        await db.todoTask.delete({
            where: { 
                id: taskId,
                userId
            }
        });
        
        return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}