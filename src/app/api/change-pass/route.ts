import { getUserId } from "@/lib/auth";
import db from "@/lib/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function GET(req: Request) {

    const url = new URL(req.url);
    const userId = await getUserId(req)
    const oldPass = url.searchParams.get("oldPass");
    
    if (!oldPass) {
        return NextResponse.json({error: "Old password is required"}, {status: 403})
    }
    try {

        const currentPassword = await db.user.findMany({
            where: {id: userId},
            select: {password: true}
    })
    if (!currentPassword) {
        return NextResponse.json({error: "No user found"}, {status: 404})
    }
    
    const isValid = await bcrypt.compare(oldPass, currentPassword[0].password)
    if (isValid) {
        return NextResponse.json({success: true, currentPassword}, {status: 200})
    }   
    return NextResponse.json({error: "Your Password Didn't match", success: false}, {status: 400})
}
catch (err) {
    return NextResponse.json({error: err, success: false}, {status: 500})
}
}

export async function PUT(req: Request) {
    const {newPass} = await req.json()
    const userId = await getUserId(req)

    try {
        const hashPass = await bcrypt.hash(newPass, 10)

        const data = await db.user.update({
            where: {id: userId},
            data: {
                password: hashPass
            }
        })   
        return NextResponse.json({success: true, data}, {status: 200})
    }
    catch (err) {
        return NextResponse.json({error: err}, {status: 500})
    }
}