import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import db from "@/lib/client";
import { verifyToken } from "@/lib/jwt";
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
