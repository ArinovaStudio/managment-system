import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

const timezones = [
  { code: "IND", name: "India Standard Time", hours: "10AM-5PM", offset: "+05:30", startTime: "10:00", endTime: "17:00" },
  { code: "USA", name: "Eastern Standard Time", hours: "2PM-8PM", offset: "-05:00", startTime: "14:00", endTime: "20:00" },
  { code: "UK",  name: "Greenwich Mean Time", hours: "6PM-1AM", offset: "+00:00", startTime: "18:00", endTime: "01:00" },
];

// --------------------
// AUTH FUNCTION
// --------------------
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  let payload;
  try {
    payload = verifyToken(token) as any;
  } catch {
    throw new Error("Invalid token");
  }

  return payload.userId || payload.id; // <-- MAIN FIX
}

// --------------------
// GET HANDLER
// --------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "timezones") {
      return NextResponse.json({ success: true, timezones });
    }

    const userId = await getUserIdFromToken();

    const timezone = await db.userTimezone.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      timezone,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// --------------------
// POST HANDLER
// --------------------
export async function POST(req: Request) {
  try {
    const { action, timezone } = await req.json();

    if (action !== "set-timezone") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const selected = timezones.find((tz) => tz.code === timezone);
    if (!selected)
      return NextResponse.json({ error: "Invalid timezone code" }, { status: 400 });

    const userId = await getUserIdFromToken(); // <---- FIXED

    // Check if entry exists
    const exists = await db.userTimezone.findUnique({ where: { userId } });

    let updatedTZ;
    if (exists) {
      updatedTZ = await db.userTimezone.update({
        where: { userId },
        data: {
          code: selected.code,
          name: selected.name,
          hours: selected.hours,
          offset: selected.offset,
          startTime: selected.startTime,
          endTime: selected.endTime,
        },
      });
    } else {
      updatedTZ = await db.userTimezone.create({
        data: {
          userId,
          code: selected.code,
          name: selected.name,
          hours: selected.hours,
          offset: selected.offset,
          startTime: selected.startTime,
          endTime: selected.endTime,
        },
      });
    }

    return NextResponse.json({
      success: true,
      timezone: updatedTZ,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update timezone" },
      { status: 500 }
    );
  }
}
