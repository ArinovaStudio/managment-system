import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as any;
    const { action, faceDescriptor, userId } = await req.json();
    const currentUserId = payload.userId || payload.id;

    if (action === 'register') {
      const targetUserId = userId || currentUserId;

      // Check if user already has face data
      const existingFaceData = await db.user.findUnique({
        where: { id: targetUserId },
        select: { faceDescriptor: true }
      });

      if (existingFaceData?.faceDescriptor) {
        return NextResponse.json({ error: 'Face already registered' }, { status: 400 });
      }

      // Store face descriptor
      await db.user.update({
        where: { id: targetUserId },
        data: {
          faceDescriptor: JSON.stringify(faceDescriptor)
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Face registered successfully' 
      });

    } else if (action === 'authenticate') {
      // Get all users with face descriptors
      const users = await db.user.findMany({
        where: {
          faceDescriptor: { not: null }
        },
        select: {
          id: true,
          name: true,
          faceDescriptor: true,
          role: true
        }
      });

      if (users.length === 0) {
        return NextResponse.json({ error: 'No registered faces found' }, { status: 404 });
      }

      // Compare face descriptors
      let bestMatch = null;
      let bestDistance = Infinity;
      const threshold = 0.6;

      for (const user of users) {
        if (user.faceDescriptor) {
          const storedDescriptor = JSON.parse(user.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, storedDescriptor);
          
          if (distance < bestDistance && distance < threshold) {
            bestDistance = distance;
            bestMatch = user;
          }
        }
      }

      if (bestMatch) {
        return NextResponse.json({
          success: true,
          userId: bestMatch.id,
          userName: bestMatch.name,
          confidence: Math.max(0, (1 - bestDistance) * 100)
        });
      } else {
        return NextResponse.json({ error: 'Face not recognized' }, { status: 404 });
      }

    } else if (action === 'clock-in') {
      // Authenticate face first, then clock in
      const users = await db.user.findMany({
        where: { faceDescriptor: { not: null } },
        select: { id: true, name: true, faceDescriptor: true, isLogin: true }
      });

      let authenticatedUser = null;
      let bestDistance = Infinity;
      const threshold = 0.6;

      for (const user of users) {
        if (user.faceDescriptor) {
          const storedDescriptor = JSON.parse(user.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, storedDescriptor);
          
          if (distance < bestDistance && distance < threshold) {
            bestDistance = distance;
            authenticatedUser = user;
          }
        }
      }

      if (!authenticatedUser) {
        return NextResponse.json({ error: 'Face not recognized' }, { status: 404 });
      }

      if (authenticatedUser.isLogin) {
        return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Check if already has work hours for today
      const existingWorkHours = await db.workHours.findFirst({
        where: {
          userId: authenticatedUser.id,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingWorkHours) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });
      }

      // Update user login status and create work hours record
      const clockInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      await Promise.all([
        db.user.update({
          where: { id: authenticatedUser.id },
          data: { isLogin: true }
        }),
        db.workHours.create({
          data: {
            userId: authenticatedUser.id,
            date: today,
            clockIn: clockInTime,
            clockOut: '-',
            hours: 0
          }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: `Welcome ${authenticatedUser.name}! Clock-in successful at ${clockInTime}`,
        userId: authenticatedUser.id,
        timestamp: now.toISOString(),
        action: 'clock-in'
      });

    } else if (action === 'clock-out') {
      // Authenticate face first, then clock out
      const users = await db.user.findMany({
        where: { faceDescriptor: { not: null } },
        select: { id: true, name: true, faceDescriptor: true, isLogin: true }
      });

      let authenticatedUser = null;
      let bestDistance = Infinity;
      const threshold = 0.6;

      for (const user of users) {
        if (user.faceDescriptor) {
          const storedDescriptor = JSON.parse(user.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, storedDescriptor);
          
          if (distance < bestDistance && distance < threshold) {
            bestDistance = distance;
            authenticatedUser = user;
          }
        }
      }

      if (!authenticatedUser) {
        return NextResponse.json({ error: 'Face not recognized' }, { status: 404 });
      }

      if (!authenticatedUser.isLogin) {
        return NextResponse.json({ error: 'Not clocked in' }, { status: 400 });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Find today's work hours record
      const workHours = await db.workHours.findFirst({
        where: {
          userId: authenticatedUser.id,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!workHours) {
        return NextResponse.json({ error: 'No clock-in record found for today' }, { status: 400 });
      }

      if (workHours.clockOut !== '-') {
        return NextResponse.json({ error: 'Already clocked out today' }, { status: 400 });
      }

      // Calculate work hours
      const clockOutTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const clockInDate = new Date(`${today.toDateString()} ${workHours.clockIn}`);
      const clockOutDate = new Date(`${today.toDateString()} ${clockOutTime}`);
      
      // Handle overnight shifts
      if (clockOutDate <= clockInDate) {
        clockOutDate.setDate(clockOutDate.getDate() + 1);
      }
      
      const totalHours = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60);

      // Update user login status and work hours record
      await Promise.all([
        db.user.update({
          where: { id: authenticatedUser.id },
          data: { isLogin: false }
        }),
        db.workHours.update({
          where: { id: workHours.id },
          data: {
            clockOut: clockOutTime,
            hours: Math.max(0, totalHours)
          }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: `Goodbye ${authenticatedUser.name}! Clock-out successful at ${clockOutTime}. Total hours: ${totalHours.toFixed(2)}`,
        userId: authenticatedUser.id,
        timestamp: now.toISOString(),
        totalHours: Math.max(0, totalHours),
        action: 'clock-out',
        userRole: authenticatedUser.role
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json({ error: "Face recognition failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as any;
    const userId = payload.userId || payload.id;

    // Check if user has registered face
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,  // ADD THIS LINE
        faceDescriptor: true,
        name: true,
        isLogin: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      userId: user.id,
      hasFaceRegistered: !!user?.faceDescriptor,
      isLoggedIn: user?.isLogin || false,
      userName: user?.name,
      userRole: user?.role
    });
  } catch (error) {
    console.error('Face status error:', error);
    return NextResponse.json({ error: "Failed to get face status" }, { status: 500 });
  }
}

// Simple Euclidean distance calculation
function euclideanDistance(desc1: number[], desc2: number[]): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}