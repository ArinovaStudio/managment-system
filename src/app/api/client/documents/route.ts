import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import db from "@/lib/client";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userOnly = searchParams.get('userOnly');
    
    if (userOnly === 'true') {
      // Get projects for current user
      const { getUserId } = await import('@/lib/auth');
      const userId = await getUserId(req);
      
      const documents = await db.docs.findMany({
        where: { userId },
        include: {
          User: {
            select: {
              name: true
            }
          },
          Projects: true
        }
      });

      return Response.json({ success: true, documents });
    }
    
    const documents = await db.docs.findMany({
      include: {Projects: {
        select: { id: true, name: true}
      }},
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch documents", err: error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload: any = verifyToken(token);
    const userId = payload.userId || payload.id;

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!title || !file) {
      return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      
      folder: 'documents',
      resource_type: 'auto',
      public_id: `${userId}_${Date.now()}`
    });

const document = await db.docs.create({
  data: {
    title,
    fileUrl: uploadResult.secure_url,
    User: {
      connect: { id: userId },
    },
    Projects: {
      connect: { id: projectId },
    },
  },
});




    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    await db.docs.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}