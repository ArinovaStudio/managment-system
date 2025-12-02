import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const department = formData.get("department") as string;
    const phone = formData.get("phone") as string;
    const workingAs = formData.get("workingAs") as string;
    const bio = formData.get("bio") as string;
    const dob = formData.get("dob") as string;
    const role = formData.get("role") as string;
    const image = formData.get("image") as File;

    // ---- IMAGE ----
    let imageUrl = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const finalRole =
      role && ["CLIENT", "EMPLOYEE", "ADMIN"].includes(role) ? role : "CLIENT";

    // --------------------------------------------------------
    // EMPLOYEE ID GENERATION (RUNS ONLY FOR EMPLOYEE ROLE)
    // --------------------------------------------------------
    let employeeId: string | null = null;

    if (finalRole === "EMPLOYEE") {
      const last = await db.user.findFirst({
        where: { role: "EMPLOYEE", employeeId: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { employeeId: true },
      });

      let next = 1;

      if (last?.employeeId) {
        const num = parseInt(last.employeeId.split("-")[1], 10);
        if (!isNaN(num)) next = num + 1;
      }

      employeeId = `emp-${String(next).padStart(3, "0")}`;
    }

    // ---- CREATE USER ----
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        department,
        phone,
        workingAs,
        bio,
        dob,
        image: imageUrl,
        employeeId: employeeId, // only set if EMPLOYEE, else stays null
      },
    });

    // ---- TOKEN ----
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
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

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("SIGNUP_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



//get all user
export async function GET() {
  try {
    const users = await db.user.findMany({
       include: {
        Documents: true,
        // leaves: true,
        // clockRecords: true,
        // workHours: true,
        // breaks: true,
        // projectMembers: true,
        // milestones: true,
        // timezone: true,
        // tasks: true,
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

