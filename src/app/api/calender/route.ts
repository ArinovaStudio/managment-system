import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

// Auto-generate Indian holidays for any year
function getIndianHolidays(year: number) {
  return [
    { title: "New Year", month: 0, day: 1 },
    { title: "Republic Day", month: 0, day: 26 },
    { title: "Holi", month: 2, day: 14 }, // Approximate
    { title: "Good Friday", month: 3, day: 18 }, // Approximate
    { title: "Eid ul-Fitr", month: 2, day: 31 }, // Approximate
    { title: "Independence Day", month: 7, day: 15 },
    { title: "Janmashtami", month: 7, day: 16 }, // Approximate
    { title: "Gandhi Jayanti", month: 9, day: 2 },
    { title: "Dussehra", month: 9, day: 12 }, // Approximate
    { title: "Diwali", month: 9, day: 20 }, // Approximate
    { title: "Guru Nanak Jayanti", month: 10, day: 15 }, // Approximate
    { title: "Christmas", month: 11, day: 25 }
  ].map(h => ({
    title: h.title,
    date: new Date(year, h.month, h.day)
  }));
}

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // HOLIDAYS / WORKDAYS
    if (type === "holidays" || type === "workdays") {
      if (type === "holidays") {
        const currentYear = new Date().getFullYear();
        const autoHolidays = [
          ...getIndianHolidays(currentYear - 1),
          ...getIndianHolidays(currentYear),
          ...getIndianHolidays(currentYear + 1)
        ];

        const customEvents = await db.calendarEvent.findMany({
          where: { type: "HOLIDAY" },
          orderBy: { date: "asc" }
        });

        const allHolidays = [
          ...autoHolidays.map((h, i) => ({ id: `auto-${i}`, ...h, type: "HOLIDAY" })),
          ...customEvents
        ];

        return NextResponse.json({ success: true, events: allHolidays });
      }

      const events = await db.calendarEvent.findMany({
        where: { type: "WORKDAY" },
        orderBy: { date: "asc" }
      });

      return NextResponse.json({ success: true, events });
    }

    // EMPLOYEE LEAVES
    if (type === "leaves") {
      const leaves = await db.leaveReq.findMany({
        where: {
          userId,
          status: "Approved"
        }
      });

      return NextResponse.json({ success: true, leaves });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const user = await db.user.findUnique({ where: { id: payload.userId || payload.id } });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admin can manage calendar" }, { status: 403 });
    }

    const { title, date, type } = await req.json();

    if (!title || !date || !["HOLIDAY", "WORKDAY"].includes(type)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const event = await db.calendarEvent.create({
      data: {
        title,
        date: new Date(date),
        type
      }
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Calendar POST Error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const user = await db.user.findUnique({ where: { id: payload.userId || payload.id } });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admin can delete calendar events" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

    await db.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
