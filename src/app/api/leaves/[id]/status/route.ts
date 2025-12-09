import { NextResponse } from "next/server";
import  db  from "@/lib/client";

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json();

    const { id } = await context.params;


    if (!status) {
      return NextResponse.json(
        { error: "Status field is required" },
        { status: 400 }
      );
    }

    const updatedLeave = await db.leaveReq.update({
      where: { id: id },
      data: { status },
    });

    return NextResponse.json(updatedLeave, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update leave request status",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
