import { NextResponse } from "next/server";
import db from '@/lib/client';

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const rawUsername = params.username;

    // In case there are encoded characters in the URL (spaces, etc.)
    const username = decodeURIComponent(rawUsername);

    // Fetch ONE user by name, including their projects
    const user = await db.user.findFirst({
      where: {
        name: username,
      },
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

        // Include project membership
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                summary: true,
                priority: true,
                progress: true,
                status: true,
                createdAt: true,
                projectInfo: {
                  select: {
                    budget: true,
                    projectType: true,
                    supervisorAdmin: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET_USER_BY_USERNAME_ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
