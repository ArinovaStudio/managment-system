import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { quote } = await req.json();
    if (!quote?.trim()) return NextResponse.json({ error: "Quote required" }, { status: 400 });

    const sharedQuote = await db.sharedQuote.create({
      data: { quote, author: user.name, userId }
    });

    return NextResponse.json({ success: true, quote: sharedQuote });
  } catch (error) {
    return NextResponse.json({ error: "Failed to share quote" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;
    const user = await db.user.findUnique({ where: { id: userId } });

    const { searchParams } = new URL(req.url);
    const selected = searchParams.get('selected');

    if (selected === 'true') {
      const quote = await db.sharedQuote.findFirst({
        where: { isSelected: true },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ success: true, quote });
    }

    if (user?.role === 'ADMIN') {
      const quotes = await db.sharedQuote.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, quotes });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Only admin can select quotes" }, { status: 403 });
    }

    const { quoteId } = await req.json();

    await db.sharedQuote.updateMany({
      where: { isSelected: true },
      data: { isSelected: false }
    });

    const selectedQuote = await db.sharedQuote.update({
      where: { id: quoteId },
      data: { isSelected: true, isApproved: true }
    });

    await db.analytics.updateMany({
      data: {
        quoteText: selectedQuote.quote,
        quoteAuthor: selectedQuote.author
      }
    });

    return NextResponse.json({ success: true, quote: selectedQuote });
  } catch (error) {
    return NextResponse.json({ error: "Failed to select quote" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Only admin can delete quotes" }, { status: 403 });
    }

    const { quoteId } = await req.json();
    if (!quoteId) return NextResponse.json({ error: "Quote ID required" }, { status: 400 });

    await db.sharedQuote.delete({ where: { id: quoteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
