import db from "@/lib/client";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    const url = new URL(req.url)
    const searchParams = url.searchParams 
    const id = searchParams.get("id")
    
    try {
        if (id) {
            const data = await db.PlanDocs.findMany({
                where: {id: id}
            })
            return NextResponse.json({success: true, data}, {status: 200})
        }

        const data = await db.PlanDocs.findMany({
            select: {
                id: true, createdBy: true, createdAt: true, name: true
            }
        })
        return NextResponse.json({success: true, data}, {status: 200})

    }
    catch (err) {
            return NextResponse.json({success: false, messge: err}, {status: 500})
    }
}

export async function DELETE(req: Request) {
    const url = new URL(req.url)
    const searchParams = url.searchParams 
    const id = searchParams.get("id")
    
    if (!id) {
            return NextResponse.json({success: false, message: "Please provide me a id"}, {status: 500})
    }

    await db.PlanDocs.deleteMany({
        where: {id: id}
    })
        return NextResponse.json({success: true, message: "Deleted Successfully"}, {status: 200})
}

export async function POST(req: Request) {
    const { name, createdBy, content} = await req.json()
    if (!createdBy || !content) {
            return NextResponse.json({success: false, message: "Please provide all the details"}, {status: 500})
    }

    try {
        const data = await db.PlanDocs.create({
            data: {
                name, createdBy, content
            }
        })
                return NextResponse.json({success: true, message: `${name} Saved on Database.`}, {status: 200})
    }
    catch (err) {
            return NextResponse.json({success: false, messge: err}, {status: 500})
    }
}

export async function PUT(req: Request) {
    const { id, name, content} = await req.json()
    if (!id || !content) {
            return NextResponse.json({success: false, message: "Please provide all the details"}, {status: 500})
    }

    try {
        const data = await db.PlanDocs.update({
            where: {id},
            data: {
                name, 
                content
            }
        })
                return NextResponse.json({success: true, message: `${id}, ${name} Updated on Database.`, data}, {status: 200})
    }
    catch (err) {
            return NextResponse.json({success: false, messge: err}, {status: 500})
    }
}