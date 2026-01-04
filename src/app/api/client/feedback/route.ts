import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const feedbacks = await db.clientfeedback.findMany({
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ success: true, feedbacks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { type, rating, desc, isAnynonyms } = await req.json();

    const feedback = await db.feedback.create({
      data: {
        type,
        rating,
        desc,
        isAnynonyms,
        byName: isAnynonyms ? "Anonymous" : user.name,
        byEmpId: user.employeeId || userId,
        employeeId: user.employeeId
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams.get("id")
    await db.clientfeedback.deleteMany({
      where: {id: searchParams}
    })
    return NextResponse.json({success: true}, {status: 200})
  }
  catch (err) {
    return NextResponse.json({success: false}, {status: 500})
  }
}