import { NextResponse } from "next/server";
import db from "@/lib/client";

export async function GET() {
  try {
    const leaveRequests = await db.leaveReq.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: { user: true },
    });
    return NextResponse.json(leaveRequests, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave requests", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      empName,
      empId,
      department,
      leaveType,
      startDate,
      endDate,
      reason,
    } = body;

    const newLeave = await db.leaveReq.create({
      data: {
        empName,
        empId,
        department,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create leave request", details: (error as Error).message },
      { status: 500 }
    );
  }
}
