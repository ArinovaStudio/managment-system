import db from "@/lib/client";
import { NextResponse } from "next/server";
import { sendMailToAdmin } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { id, meetDate, meetTime } = await req.json();

    if (!id || !meetDate || !meetTime) {
      return NextResponse.json({ success: false, message: "Missing fields" });
    }

    const meeting = await db.meetingRequest.update({
      where: { id },
      data: {
        meetDate: new Date(meetDate),
        meetTime,
        status: "pending", // after reschedule -> pending
      },
      include: {
        client: true,
        project: true,
      },
    });

    // Send email to Admin
    if (meeting.createdBy) {
      const admin = await db.user.findFirst({ where: { name: meeting.createdBy } });
      if (admin?.email) {
        await sendMailToAdmin(
          admin.email,
          admin.name,
          meeting.client.name,
          meeting.project?.name ?? "No Project",
          meeting.meetDate.toISOString().split("T")[0],
          meetTime,
          meeting.duration.toString(),
          "rescheduled"
        );
      }
    }

    return NextResponse.json({ success: true, message: "Rescheduled successfully" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false, message: "Failed to reschedule" });
  }
}
