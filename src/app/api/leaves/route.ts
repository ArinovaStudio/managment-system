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
    console.log(leaveRequests);
    
    return NextResponse.json(leaveRequests, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leave requests", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       empName,
//       empId,        // 👈 MUST BE SENT from frontend
//       department,
//       leaveType,
//       startDate,
//       endDate,
//       reason,
//     } = body;

//     const newLeave = await db.leaveReq.create({
//       data: {
//         empName,
//         empId,                      // 👈 REQUIRED FIELD
//         department,
//         leaveType,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         reason,
//       },
//     });

//     return NextResponse.json(newLeave, { status: 201 });
//   } catch (error:any) {
//     console.log(error.message);
    
//     return NextResponse.json(
//       { error: "Failed to create leave request", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      empName,
      empId,        // 👈 MUST BE SENT from frontend
      department,
      leaveType,
      startDate,
      endDate,
      reason,
    } = body;

    
    // 1️⃣ Check user exists before creating FK reference
    const user = await db.user.findUnique({
      where: { employeeId: empId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Create leave with Relation
    const newLeave = await db.leaveReq.create({
      data: {
        empName,
        empId,                      // 👈 REQUIRED FIELD
        userId: user.id,
        department,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    return NextResponse.json(newLeave, { status: 201 });

  } catch (error: any) {
    console.log(error.message);

    return NextResponse.json(
      {
        error: "Failed to create leave request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
