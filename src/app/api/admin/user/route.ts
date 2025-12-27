import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import db from "@/lib/client";
import { verifyToken } from "@/lib/jwt";

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
    const {
      name,
      email,
      password,
      role,
      department,
      workingAs,
      phone,
    } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
        isLogin: false, // IMPORTANT
        employeeId: role !== "CLIENT" ? employeeId : null,
      },
    });

    // 🚫 DO NOT LOGIN USER
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
