import { getUserId } from "@/lib/auth";
import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const { summary } = await req.json();

    if (!summary?.trim()) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const workHours = await db.workHours.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!workHours) {
      return NextResponse.json({ error: 'No work record found for today' }, { status: 400 });
    }

    if (workHours.clockOut !== '-') {
      return NextResponse.json({ error: 'Already clocked out today' }, { status: 400 });
    }

    const clockOutTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const clockInDate = new Date(`${today.toDateString()} ${workHours.clockIn}`);
    const clockOutDate = new Date(`${today.toDateString()} ${clockOutTime}`);
    
    if (clockOutDate <= clockInDate) {
      clockOutDate.setDate(clockOutDate.getDate() + 1);
    }
    
    const totalHours = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60);

    await Promise.all([
      db.user.update({
        where: { id: userId },
        data: { isLogin: false }
      }),
      db.workHours.update({
        where: { id: workHours.id },
        data: {
          clockOut: clockOutTime,
          hours: Math.max(0, totalHours),
          summary: summary.trim()
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: `Clock-out successful at ${clockOutTime}. Total hours: ${totalHours.toFixed(2)}`,
      totalHours: Math.max(0, totalHours)
    });

  } catch (error: any) {
    console.error('Work summary error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to save work summary" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}