import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, department, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine final role (default to EMPLOYEE)
    const finalRole = role === "ADMIN" ? "ADMIN" : "EMPLOYEE";

    let employeeId: string | null = null;

    if (finalRole === "EMPLOYEE") {
      const lastEmployee = await db.user.findFirst({
        where: { role: "EMPLOYEE" },
        orderBy: { createdAt: "desc" },
        select: { employeeId: true },
      });

      let nextNumber = 1;
      if (lastEmployee?.employeeId) {
        const parts = lastEmployee.employeeId.split("-");
        const lastNumber = parseInt(parts[1], 10);
        nextNumber = lastNumber + 1;
      }

      employeeId = `emp-${nextNumber.toString().padStart(3, "0")}`;
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        department,
        phone,
        employeeId,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("SIGNUP_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
