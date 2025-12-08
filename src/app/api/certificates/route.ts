import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import db from '@/lib/client';
import cloudinary from '@/lib/cloudinary';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const adminParam = url.searchParams.get("admin");

    // ------- ADMIN MODE -------
    if (adminParam && adminParam.toLowerCase() === "true") {
      const certificates = await db.certificate.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(certificates);
    }

    // ------- USER MODE -------
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token) as any;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId || payload.id;

    const certificates = await db.certificate.findMany({
      where: {
        assignedTo: userId
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("CERTIFICATE GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const assignedTo = formData.get('assignedTo') as string;
    const createdBy = formData.get('createdBy') as string;

    if (!file || !title || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'certificates',
          transformation: [{ width: 800, height: 600, crop: 'fill' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const uploadResult = result as any;

    const certificate = await db.certificate.create({
      data: {
        title,
        description,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        assignedTo: assignedTo || null,
        createdBy
      }
    });

    return NextResponse.json(certificate);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    
    const user = await db.user.findUnique({
      where: { id: payload.userId || payload.id },
      select: { role: true }
    });
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    const certificate = await db.certificate.findUnique({ where: { id } });
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    await cloudinary.uploader.destroy(certificate.publicId);
    await db.certificate.delete({ where: { id } });

    return NextResponse.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}