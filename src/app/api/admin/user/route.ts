import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import db from "@/lib/client";
import { verifyToken } from "@/lib/jwt";

interface User {
    id: string;
    name: string;
    email: string;
    dob: string;
    phone?: string;
    department?: string;
    workingAs?: string;
    isDev: boolean;
    image?: string | null;
    employeeId?: string | null;
}

const timezones = [
  { code: "IND", name: "India Standard Time", hours: "10AM-5PM", offset: "+05:30", startTime: "10:00", endTime: "17:00" },
  { code: "USA", name: "Eastern Standard Time", hours: "2AM-8PM", offset: "-05:00", startTime: "02:00", endTime: "20:00" },
  { code: "UK",  name: "Greenwich Mean Time", hours: "6PM-1AM", offset: "+00:00", startTime: "18:00", endTime: "01:00" },
];

export async function POST(req: Request) {
  try {
    // 🔐 AUTH CHECK
    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = verifyToken(token) as any;
    if (admin.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 📦 DATA
    const {editUser, timezoneCode} = await req.json();
    const {
      name,
      email,
      password,
      role,
      dob,
      department,
      workingAs,
      phone,
      isDev,
    } = editUser;
    
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const selected = timezones.find(tz => tz.code === timezoneCode);
    if (!selected) {
          return NextResponse.json({ error: "Invalid timezone", selected }, { status: 400 });
        }

    // 🚫 DUPLICATE CHECK
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    const lastEmployee = await db.user.findFirst({
        where: { employeeId: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { employeeId: true },
      });

      let nextNumber = 1;
      if (lastEmployee?.employeeId) {
        const num = parseInt(lastEmployee.employeeId.split("-")[1], 10);
        if (!isNaN(num)) nextNumber = num + 1;
      }

      const employeeId = `emp-${String(nextNumber).padStart(3, "0")}`;


    // 🔑 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER (ANY ROLE)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role, // ADMIN | EMPLOYEE | CLIENT
        department,
        workingAs,
        phone,
        dob,
        isDev,
        isLogin: false, // IMPORTANT
        employeeId: role !== "CLIENT" ? employeeId : null,
        timezone: {
        create: {
        code: selected.code,
        name: selected.name,
        hours: selected.hours,
        offset: selected.offset,
        startTime: selected.startTime,
        endTime: selected.endTime,
          }
        }
      },
  });

    // 🚫 DO NOT LOGIN USER
    return NextResponse.json({ user }, { status: 201 });
  } 
  catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
      dob,
      isDev,
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
        dob: dob || null,
        isDev: isDev
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

