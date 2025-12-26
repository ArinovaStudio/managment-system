import { NextResponse } from "next/server";
import db from "@/lib/client";
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    workingAs?: string;
    image?: string | null;
    employeeId?: string | null;
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      name,
      email,
      phone,
      department,
      workingAs,
      image,
      employeeId,
    } = body as User;

    /* ---------------- Validation ---------------- */
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and Email are required" },
        { status: 400 }
      );
    }

    /* ---------------- Check if user exists ---------------- */
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------------- Update user ---------------- */
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        department: department || null,
        workingAs: workingAs || null,
        image: image || null,
        employeeId: employeeId || null,
      },
    });

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("UPDATE_USER_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------------- DELETE DEPENDENCIES FIRST ---------------- */

    await db.projectMember.deleteMany({
      where: { userId: user.id },
    });

    await db.leaveReq.deleteMany({
      where: { userId: user.id },
    });

    await db.clockRecord.deleteMany({
      where: { userId: user.id },
    });

    // add other relations if they exist
    // documents, meetings, etc.

    /* ---------------- DELETE USER ---------------- */

    await db.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE_USER_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

