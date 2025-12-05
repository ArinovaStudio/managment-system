import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDay + 1 + (weekOffset * 7));
  
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const weekOffset = parseInt(searchParams.get("week") || "0");
    const userId = await getUserId(req);

    const weekDates = getWeekDates(weekOffset);
    const startDate = weekDates[0];
    const endDate = new Date(weekDates[5]);
    endDate.setHours(23, 59, 59, 999);

    const workHours = await db.workHours.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: "asc" }
    });

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    // Get break times for the week
    const breakTimes = await db.break.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate
        },
        isActive: false // Only completed breaks
      }
    });

    const weekData = weekDates.map((date, index) => {
      const dayData = workHours.find(wh => 
        wh.date.toDateString() === date.toDateString()
      );
      
      // Calculate total break time for this day
      const dayBreaks = breakTimes.filter(breakRecord => {
        const breakDate = new Date(breakRecord.startTime);
        return breakDate.toDateString() === date.toDateString();
      });
      
      const totalBreakMinutes = dayBreaks.reduce((total, breakRecord) => {
        return total + (breakRecord.duration || 0);
      }, 0);
      
      const totalBreakHours = totalBreakMinutes / 60;
      const actualWorkingHours = Math.max(0, (dayData?.hours || 0) - totalBreakHours);
      
      return {
        day: dayNames[index],
        date: date.toISOString().split('T')[0],
        hours: actualWorkingHours, // Actual working hours (total - break time)
        totalHours: dayData?.hours || 0, // Total clocked hours
        breakHours: totalBreakHours, // Break time in hours
        login: dayData?.clockIn || "-",
        logout: dayData?.clockOut || "-"
      };
    });

    const weekLabel = `${weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekDates[5].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

    return NextResponse.json({ 
      success: true, 
      data: weekData,
      weekLabel,
      weekOffset
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch work hours" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { action, date, clockIn, clockOut } = await req.json();
    const userId = await getUserId(req);

    if (action === "update") {
      const targetDate = new Date(date);
      let clockInTime = new Date(`${date}T${clockIn}`);
      let clockOutTime = new Date(`${date}T${clockOut}`);
      
      // Handle overnight shifts (clock out next day)
      if (clockOutTime <= clockInTime) {
        clockOutTime.setDate(clockOutTime.getDate() + 1);
      }
      
      const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const existing = await db.workHours.findFirst({
        where: {
          userId,
          date: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999))
          }
        }
      });

      if (existing) {
        await db.workHours.update({
          where: { id: existing.id },
          data: {
            hours,
            clockIn: formatTime(clockInTime),
            clockOut: formatTime(clockOutTime)
          }
        });
      } else {
        await db.workHours.create({
          data: {
            userId,
            date: targetDate,
            hours,
            clockIn: formatTime(clockInTime),
            clockOut: formatTime(clockOutTime)
          }
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const targetDate = new Date(date);
      
      const deleted = await db.workHours.deleteMany({
        where: {
          userId,
          date: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999))
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        deleted: deleted.count 
      });
    }

    if (action === "deleteAll") {
      const deleted = await db.workHours.deleteMany({
        where: { userId }
      });

      return NextResponse.json({ 
        success: true, 
        deleted: deleted.count 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update work hours" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
