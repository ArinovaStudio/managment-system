import { NextResponse } from "next/server";
import db from "@/lib/client";

export async function GET(req: Request) {
  const url = new URL(req.url)
  const empId = url.searchParams.get("empId")
  const id = url.searchParams.get("id")

  if (id) {
    const leaveRequests = await db.leaveReq.findMany({
      where: {empId: empId},
      orderBy: {
        createdAt: "desc",
      },
      include: { user: true },
    });
    const leaveStats = await db.UserLeaves.findMany({
      where: {
        userId: id
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json({leaveRequests, leaveStats}, { status: 200 });
  }
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

    const user = await db.user.findUnique({ where: { employeeId: empId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newLeave = await db.leaveReq.create({
      data: {
        empName,
        empId,
        department,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        userId: user.id,
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
