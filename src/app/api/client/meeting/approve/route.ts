import db from "@/lib/client";
import { NextResponse } from "next/server";
import { sendMailToAdmin } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Meeting ID missing" });
    }

    const meeting = await db.meetingRequest.update({
      where: { id },
      data: { status: "approved" },
      include: {
        client: true,
        project: true,
      },
    });

    // Send Email to Admin
    if (meeting.createdBy) {
      const admin = await db.user.findFirst({ where: { name: meeting.createdBy } });
      if (admin?.email) {
        await sendMailToAdmin(
          admin.email,
          admin.name,
          meeting.client.name,
          meeting.project?.name ?? "No Project",
          meeting.meetDate.toISOString().split("T")[0],
          meeting.meetTime,
          meeting.duration.toString(),
          "approved"
        );
      }
    }

    return NextResponse.json({ success: true, message: "Meeting approved" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false, message: "Failed" });
  }
}
