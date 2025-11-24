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
  // Find last employee with a valid employeeId
  const lastEmployee = await db.user.findFirst({
    where: {
      role: "EMPLOYEE",
      employeeId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { employeeId: true },
  });

  let nextNumber = 1;

  if (lastEmployee?.employeeId) {
    const num = parseInt(lastEmployee.employeeId.split("-")[1], 10);
    if (!isNaN(num)) nextNumber = num + 1;
  }

  employeeId = `emp-${String(nextNumber).padStart(3, "0")}`;
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


//get all user
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("GET_USERS_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

//delete all user
export async function DELETE() {
  try {
    await db.user.deleteMany({});

    return NextResponse.json(
      { message: "All users deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE_USERS_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

