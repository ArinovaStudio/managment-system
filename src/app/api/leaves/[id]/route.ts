import { NextResponse } from "next/server";
import db from "@/lib/client";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const leave = await db.leaveReq.findUnique({
      where: { id: params.id },
      
    });

    if (!leave) {
      return NextResponse.json({ message: "Leave request not found" }, { status: 404 });
    }

    return NextResponse.json(leave, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave request", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
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
      status,
    } = body;

    const updatedLeave = await db.leaveReq.update({
      where: { id: params.id },
      data: {
        empName,
        empId,
        department,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status,
      },
    });

    return NextResponse.json(updatedLeave, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update leave request", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const deletedLeave = await db.leaveReq.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Leave request deleted successfully", deletedLeave },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete leave request", details: (error as Error).message },
      { status: 500 }
    );
  }
}
