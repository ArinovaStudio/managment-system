import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import db from '@/lib/client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        const payload = verifyToken(token) as any;
        await db.user.update({
          where: { id: payload.userId || payload.id },
          data: { isLogin: false }
        });
      } catch (error) {
        console.error('Error updating user logout status:', error);
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('token');
    return response;
  } catch (error) {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('token');
    return response;
  }
}