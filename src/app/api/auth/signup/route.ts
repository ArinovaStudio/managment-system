import { NextResponse } from "next/server";
import db from "@/lib/client";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
import { generateAndSendOtp, verifyOtp } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type');
    
    // Handle JSON requests (OTP operations)
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      const { action, email, otp } = body;

      if (action === "send-otp") {
        // Check if user already exists
        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
          return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        await generateAndSendOtp(email, "SIGNUP");
        return NextResponse.json({ message: "OTP sent successfully" });
      }

      if (action === "verify-otp") {
        const isValid = await verifyOtp(email, otp, "SIGNUP");
        if (!isValid) {
          return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }
        return NextResponse.json({ message: "OTP verified successfully" });
      }
    }

    // Handle FormData requests (actual signup)
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const workingAs = formData.get('workingAs') as string;
    const bio = formData.get('bio') as string;
    const dob = formData.get('dob') as string;
    const role = formData.get('role') as string;
    const image = formData.get('image') as File;

    let employeeId: string;
    
    let imageUrl = null;
    if (image && image.size > 0) {
      // Convert image to base64 string for storage
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = `data:${image.type};base64,${buffer.toString('base64')}`;
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine final role (default to CLIENT if not provided)
    const finalRole = role && ['CLIENT', 'EMPLOYEE', 'ADMIN'].includes(role) ? role : 'CLIENT';

    // Generate employeeId for all users
    const lastEmployee = await db.user.findFirst({
      where: { employeeId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { employeeId: true },
    });

    let nextNumber = 1;
    if (lastEmployee?.employeeId) {
      const parts = lastEmployee.employeeId.split("-");
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

employeeId = `emp-${nextNumber.toString().padStart(3, "0")}`;

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        phone,
        workingAs,
        bio,
        dob,
        image: imageUrl,
        employeeId: employeeId,
      },
    });

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

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    employeeId: true,
    department: true,
    phone: true,
    createdAt: true,
    image: true,
    isLogin: true,
    workingAs: true,
    bio: true,
    dob: true,
    faceDescriptor: true,

    // RELATIONS
    breaks: true,
    clockRecords: true,
    Documents: true,
    meetingRequests: true,
    milestones: true,
    leaves: true,
    timezone: true,
    workHours: true,
    featureRequests: true,
    createdMeetings: true,
    meetingAssigned: true,
    leaveRequests: true,

    // ProjectMembers → include the Project model
    projectMembers: {
  include: {
    project: {
      include: {
        projectInfo: true,     // <-- ADD THIS
      },
    },
  },
},

  },

  orderBy: { createdAt: "desc" },
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

