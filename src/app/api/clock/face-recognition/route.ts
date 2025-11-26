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
          faceDescriptor: true
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

      await db.user.update({
        where: { id: authenticatedUser.id },
        data: { isLogin: true }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Welcome ${authenticatedUser.name}! Clock-in successful`,
        userId: authenticatedUser.id,
        timestamp: new Date().toISOString()
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

      await db.user.update({
        where: { id: authenticatedUser.id },
        data: { isLogin: false }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Goodbye ${authenticatedUser.name}! Clock-out successful`,
        userId: authenticatedUser.id,
        timestamp: new Date().toISOString()
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
        faceDescriptor: true,
        name: true,
        isLogin: true
      }
    });

    return NextResponse.json({ 
      hasFaceRegistered: !!user?.faceDescriptor,
      isLoggedIn: user?.isLogin || false,
      userName: user?.name
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