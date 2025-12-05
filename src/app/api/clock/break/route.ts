import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as any;
    const { breakType, action } = await req.json();
    const userId = payload.userId || payload.id;

    if (action === 'start') {
      // Check if user already has an active break
      const activeBreak = await db.break.findFirst({
        where: {
          userId,
          isActive: true
        }
      });

      if (activeBreak) {
        return NextResponse.json({ error: 'You already have an active break' }, { status: 400 });
      }

      // Create new break record and set user offline
      const [newBreak, updatedUser] = await Promise.all([
        db.break.create({
          data: {
            userId,
            type: breakType.toUpperCase() as any,
            startTime: new Date(),
            isActive: true
          }
        }),
        db.user.update({
          where: { id: userId },
          data: { isLogin: false }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: 'Break started successfully',
        break: newBreak
      });
    } else if (action === 'end') {
      // Find and end the active break
      const activeBreak = await db.break.findFirst({
        where: {
          userId,
          type: breakType.toUpperCase() as any,
          isActive: true
        }
      });

      if (!activeBreak) {
        return NextResponse.json({ error: 'No active break found' }, { status: 400 });
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - activeBreak.startTime.getTime()) / (1000 * 60));

      const [updatedBreak, updatedUser] = await Promise.all([
        db.break.update({
          where: { id: activeBreak.id },
          data: {
            endTime,
            duration,
            isActive: false
          }
        }),
        db.user.update({
          where: { id: userId },
          data: { isLogin: true }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: 'Break ended successfully',
        break: updatedBreak
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Break API Error:', error);
    return NextResponse.json({ error: "Failed to process break request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as any;
    const userId = payload.userId || payload.id;

    // Get active break for user
    const activeBreak = await db.break.findFirst({
      where: {
        userId,
        isActive: true
      }
    });

    const breakTypes = [
      { 
        id: 'coffee', 
        name: 'Take a Break', 
        duration: 15, 
        description: 'Pissed with work?\nTake a 15min. Break',
        color: 'purple',
        icon: 'Coffee'
      },
      { 
        id: 'meal', 
        name: 'Meal Break', 
        duration: 30, 
        description: 'Food is here?\nTake a 30min. Break',
        color: 'yellow',
        icon: 'CookingPot'
      },
    ];

    // Get today's total break time
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayBreaks = await db.break.findMany({
      where: {
        userId,
        startTime: {
          gte: todayStart,
          lt: todayEnd
        },
        isActive: false // Only completed breaks
      }
    });
    
    const totalBreakTime = todayBreaks.reduce((total, breakRecord) => {
      return total + (breakRecord.duration || 0);
    }, 0);

    return NextResponse.json({ 
      breakTypes,
      activeBreak: activeBreak ? {
        id: activeBreak.type.toLowerCase(),
        startTime: activeBreak.startTime
      } : null,
      todayBreakTime: totalBreakTime
    });
  } catch (error) {
    console.error('Break GET Error:', error);
    return NextResponse.json({ error: "Failed to fetch break types" }, { status: 500 });
  }
}