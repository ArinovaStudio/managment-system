import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);

    // Get last 30 days of work hours for better averages
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workHours = await db.workHours.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { date: "desc" }
    });

    if (workHours.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          avgClockIn: "9:00 AM",
          avgClockOut: "5:00 PM", 
          avgWorkingHours: "8:00",
          totalPayPeriod: "0:00"
        }
      });
    }

    // Calculate averages
    const clockInTimes = workHours.map(wh => {
      const time = wh.clockIn.split(' ');
      const [hours, minutes] = time[0].split(':').map(Number);
      const isPM = time[1] === 'PM';
      return (isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours) * 60 + minutes;
    });

    const clockOutTimes = workHours.map(wh => {
      const time = wh.clockOut.split(' ');
      const [hours, minutes] = time[0].split(':').map(Number);
      const isPM = time[1] === 'PM';
      return (isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours) * 60 + minutes;
    });

    const avgClockInMinutes = Math.round(clockInTimes.reduce((a, b) => a + b, 0) / clockInTimes.length);
    const avgClockOutMinutes = Math.round(clockOutTimes.reduce((a, b) => a + b, 0) / clockOutTimes.length);
    const avgHours = workHours.reduce((sum, wh) => sum + wh.hours, 0) / workHours.length;
    const totalHours = workHours.reduce((sum, wh) => sum + wh.hours, 0);

    // Convert minutes back to time format
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    const formatHours = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
    };

    return NextResponse.json({
      success: true,
      stats: {
        avgClockIn: formatTime(avgClockInMinutes),
        avgClockOut: formatTime(avgClockOutMinutes),
        avgWorkingHours: formatHours(avgHours),
        totalPayPeriod: formatHours(totalHours)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}