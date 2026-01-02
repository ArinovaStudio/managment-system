import { getUserId } from "@/lib/auth";
import db from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const workSummaries = await db.workHours.findMany({
      where: {
        summary: {
          not: null
        },
        date: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        user: {
          select: {
            name: true,
            workingAs: true,
            image: true,
            department: true,
            breaks: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ success: true, reports: workSummaries });
  } catch (error: any) {
    console.error('Failed to fetch daily reports:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch daily reports" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const { summary } = await req.json();

    if (!summary?.trim()) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    const now = new Date();
    
    // Find ANY active work session (clockOut: '-') regardless of date
    const workHours = await db.workHours.findFirst({
      where: {
        userId,
        clockOut: '-'
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!workHours) {
      return NextResponse.json({ error: 'No active work session found' }, { status: 400 });
    }

    // Allow re-clocking out by resetting if already clocked out
    if (workHours.clockOut !== '-') {
      // Reset for re-clock out
      await db.workHours.update({
        where: { id: workHours.id },
        data: { clockOut: '-', hours: 0 }
      });
    }

    const clockOutTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Use the actual session date for clock-in calculation
    const sessionDate = new Date(workHours.date);
    const clockInDate = new Date(`${sessionDate.toDateString()} ${workHours.clockIn}`);
    
    const totalHours = (now.getTime() - clockInDate.getTime()) / (1000 * 60 * 60);

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

export async function DELETE(req: Request) {
  try {
    const danger = await db.workHours.deleteMany({
    where: {
        summary: {
          not: null
        }
  }})
  return NextResponse.json({ success: true, deletedCount: danger.count });
  }
  catch {
    return NextResponse.json({ error: 'Failed to delete summaries' }, { status: 500 });
  }
}