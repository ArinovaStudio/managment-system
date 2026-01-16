import db from "@/lib/client";

// create meetings by client
export async function POST(req: Request) {
  try {
    const { clientId, reason, meetDate, meetTime, duration } =
      await req.json();

    if (!clientId || !reason || !meetDate || !meetTime || !duration) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const client = await db.user.findUnique({ where: { id: clientId } });

    if (!client) {
      return Response.json(
        { error: "Client not found (invalid clientId)" },
        { status: 404 }
      );
    }

    const meeting = await db.meetingRequest.create({
      data: {
        clientId,
        reason,
        meetDate: new Date(meetDate),
        meetTime,
        duration: Number(duration),
      },
    });

    return Response.json(
      { message: "Meeting request created", meeting },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: error }, { status: 500 });
  }
}

// fetch all meetings
export async function GET() {
  try {
    const meetings = await db.meetingRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ meetings }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e }, { status: 500 });
  }
}

//delete a meeting
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.meetingRequest.delete({ where: { id: params.id } });

    return Response.json(
      { message: "Meeting request cancelled" },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e }, { status: 500 });
  }
}
