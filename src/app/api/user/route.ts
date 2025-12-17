import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import db from '@/lib/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const getAll = searchParams.get('all');

    if (getAll === 'true') {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          workingAs: true,
          department: true,
          role: true,
          employeeId: true,
          isLogin: true,
          clockRecords: true,
          workHours: true,
        },
        orderBy: { name: 'asc' }
      });
      return NextResponse.json({ success: true, users });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token) as any;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId || payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        phone: true,
        bio: true,
        image: true,
        dob: true,
        workingAs: true,
        createdAt: true,
        updatedAt: true,
        isLogin: true,
        clockRecords: true,
        workHours: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token) as any;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, phone, bio, department, workingAs, dob } = await req.json();

    const updatedUser = await db.user.update({
      where: { id: payload.userId || payload.id },
      data: { name, phone, bio, department, workingAs, dob },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        phone: true,
        bio: true,
        image: true,
        dob: true,
        workingAs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}