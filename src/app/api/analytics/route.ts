import { NextResponse } from "next/server";
import db from "@/lib/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// export async function GET() {
//   try {
//     const [
//       totalUsers,
//       pendingLeaves,
//       approvedLeaves,
//       totalFeedbacks,
//       recentLeaves,
//       recentFeedbacks,
//       usersOnBreak,
//       onlineUsers
//     ] = await Promise.all([
//       db.user.count(),
//       db.leaveReq.count({ where: { status: "Pending" } }),
//       db.leaveReq.count({ where: { status: "Approved" } }),
//       db.feedback.count(),
//       db.leaveReq.findMany({
//         take: 4,
//         orderBy: { id: "desc" },
//         select: { id: true, empName: true, leaveType: true, status: true }
//       }),
//       db.feedback.findMany({
//         take: 3,
//         orderBy: { id: "desc" },
//         select: { id: true, type: true, desc: true, byName: true }
//       }),
//       db.break.count({ where: { isActive: true } }),
//       db.user.count({ where: { isLogin: true } })
//     ]);

//     const analytics = {
//       quote: {
//         text: `You have ${pendingLeaves} pending tasks and ${approvedLeaves} completed projects.`,
//         author: "System Analytics"
//       },

//       stats: {
//         projects: approvedLeaves,   
//         pendingTasks: pendingLeaves,
//         onlineUsers,
//         usersOnBreak
//       },

//       performance: [
//         { label: "Online Users", value: Math.min(onlineUsers * 10, 100), color: "#10b981" },
//         { label: "On Break", value: Math.min(usersOnBreak * 20, 100), color: "#f59e0b" },
//         { label: "Leaves", value: Math.min((approvedLeaves + pendingLeaves) * 10, 100), color: "#8b5cf6" },
//         { label: "Feedback", value: Math.min(totalFeedbacks * 15, 100), color: "#ec4899" },
//         { label: "Approved", value: Math.min(approvedLeaves * 20, 100), color: "#3b82f6" },
//         { label: "Total Users", value: Math.min(totalUsers * 5, 100), color: "#06b6d4" }
//       ],

//       tasks: recentLeaves.map(leave => ({
//         id: leave.id,
//         title: `${leave.leaveType} - ${leave.empName}`,
//         completed: leave.status === "Approved",
//         priority: leave.status === "Pending" ? "high" : "low"
//       })),

//       meetings: recentFeedbacks.map(feedback => ({
//         id: feedback.id,
//         title: `${feedback.type} Feedback`,
//         time: "Review",
//         date: feedback.byName
//       }))
//     };

//     return NextResponse.json({ analytics }, { status: 200 });
//   } catch (error) {
//     console.error("Analytics Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch analytics data" },
//       { status: 500 }
//     );
//   }
// }


export async function GET() {
  try {
    // 1. Read JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Verify token and extract userId
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    const userId = decoded.userId;

    // 3. Fetch analytics data (FIXED FIELD MAPPINGS)
    const [
      totalUsers,
      pendingLeaves,
      approvedLeaves,
      totalFeedbacks,
      recentLeaves,
      recentFeedbacks,
      usersOnBreak,
      onlineUsers
    ] = await Promise.all([
      // user table
      db.user.count({
        where: { id: userId }
      }),

      // leaveReq table (uses userId)
      db.leaveReq.count({
        where: { status: "Pending", userId }
      }),

      db.leaveReq.count({
        where: { status: "Approved", userId }
      }),

      // feedback table (uses employeeId ❗)
      db.feedback.count({
        where: { employeeId: userId }
      }),

      db.leaveReq.findMany({
        where: { userId },
        take: 4,
        orderBy: { id: "desc" },
        select: {
          id: true,
          empName: true,
          leaveType: true,
          status: true
        }
      }),

      db.feedback.findMany({
        where: { employeeId: userId },
        take: 3,
        orderBy: { id: "desc" },
        select: {
          id: true,
          type: true,
          desc: true,
          byName: true
        }
      }),

      db.break.count({
        where: { isActive: true, userId }
      }),

      db.user.count({
        where: { id: userId, isLogin: true }
      })
    ]);

    // 4. SAME analytics structure (UNCHANGED)
    const analytics = {
      quote: {
        text: `You have ${pendingLeaves} pending tasks and ${approvedLeaves} completed projects.`,
        author: "System Analytics"
      },

      stats: {
        projects: approvedLeaves,
        pendingTasks: pendingLeaves,
        onlineUsers,
        usersOnBreak
      },

      performance: [
        { label: "Online Users", value: Math.min(onlineUsers * 10, 100), color: "#10b981" },
        { label: "On Break", value: Math.min(usersOnBreak * 20, 100), color: "#f59e0b" },
        { label: "Leaves", value: Math.min((approvedLeaves + pendingLeaves) * 10, 100), color: "#8b5cf6" },
        { label: "Feedback", value: Math.min(totalFeedbacks * 15, 100), color: "#ec4899" },
        { label: "Approved", value: Math.min(approvedLeaves * 20, 100), color: "#3b82f6" },
        { label: "Total Users", value: Math.min(totalUsers * 5, 100), color: "#06b6d4" }
      ],

      tasks: recentLeaves.map(leave => ({
        id: leave.id,
        title: `${leave.leaveType} - ${leave.empName}`,
        completed: leave.status === "Approved",
        priority: leave.status === "Pending" ? "high" : "low"
      })),

      meetings: recentFeedbacks.map(feedback => ({
        id: feedback.id,
        title: `${feedback.type} Feedback`,
        time: "Review",
        date: feedback.byName
      }))
    };

    return NextResponse.json({ analytics }, { status: 200 });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Invalid token or analytics failure" },
      { status: 401 }
    );
  }
}


