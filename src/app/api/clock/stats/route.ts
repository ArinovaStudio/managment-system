import { NextResponse } from "next/server";
import db from "@/lib/client";
import { getUserId } from "@/lib/auth";

function parseTimeToMinutes(timeStr: string) {
  // "04:28 PM" → minutes since midnight
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

function formatMinutesToTime(minutes: number) {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;

  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;

  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDecimalHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workHours = await db.workHours.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
    });

    if (workHours.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          avgClockIn: null,
          avgClockOut: null,
          avgWorkingHours: null,
          totalPayPeriod: "0:00",
        },
        hasActiveSession: false,
        activeWorkSession: null,
      });
    }

    // Completed sessions only (have clockOut)
    const completed = workHours.filter(w => w.clockOut !== "-");

    // ---- AVERAGE CLOCK-IN ----
    const clockInMinutes = workHours
      .map(w => parseTimeToMinutes(w.clockIn));

    const avgClockIn =
      clockInMinutes.length > 0
        ? formatMinutesToTime(
            Math.round(clockInMinutes.reduce((a, b) => a + b, 0) / clockInMinutes.length)
          )
        : null;

    // ---- AVERAGE CLOCK-OUT (ONLY IF EXISTS) ----
    const clockOutMinutes = completed
      .map(w => parseTimeToMinutes(w.clockOut));

    const avgClockOut =
      clockOutMinutes.length > 0
        ? formatMinutesToTime(
            Math.round(clockOutMinutes.reduce((a, b) => a + b, 0) / clockOutMinutes.length)
          )
        : null;   // ❌ NO FAKE 5PM

    // ---- HOURS ----
    const totalHours = completed.reduce((sum, w) => sum + w.hours, 0);
    const avgHours =
      completed.length > 0 ? totalHours / completed.length : null;

    // ---- ACTIVE SESSION ----
    const activeWorkSession = await db.workHours.findFirst({
      where: {
        userId,
        clockOut: "-",
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        avgClockIn,
        avgClockOut,
        avgWorkingHours: avgHours ? formatDecimalHours(avgHours) : null,
        totalPayPeriod: formatDecimalHours(totalHours),
      },
      hasActiveSession: !!activeWorkSession,
      activeWorkSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
