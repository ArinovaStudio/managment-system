import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import db from "@/lib/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const { password, action } = await req.json();

    if (!password?.trim()) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, password: true, isLogin: true, workingAs: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password (skip for summary-clockout)
    if (password !== 'summary-clockout') {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (action === 'clock-in') {
      if (user.isLogin) {
        return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
      }

      // Check if already has work hours for today
      const existingWorkHours = await db.workHours.findFirst({
        where: {
          userId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingWorkHours) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
      }

      const clockInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      await Promise.all([
        db.user.update({
          where: { id: userId },
          data: { isLogin: true }
        }),
        db.workHours.create({
          data: {
            userId,
            date: today,
            clockIn: clockInTime,
            clockOut: '-',
            hours: 0
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: `Welcome ${user.name}! Clock-in successful at ${clockInTime}`,
        action: 'clock-in'
      });

    } else if (action === 'clock-out') {
      // Check for ANY active work session (including from previous days)
      const activeWorkHours = await db.workHours.findFirst({
        where: {
          userId,
          clockOut: '-'
        },
        orderBy: {
          date: 'desc'
        }
      });

      if (!activeWorkHours) {
        return NextResponse.json({ error: 'No active work session found' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Password authenticated for clock-out',
        action: 'clock-out-auth',
        userWorkingAs: user.workingAs
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Password auth error:', error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}