import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "clientId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get client project
    const projectMember = await db.projectMember.findFirst({
      where: { userId: clientId },
      include: {
        project: {
          include: {
            assets: true,
          },
        },
      },
    });

    if (!projectMember || !projectMember.project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const assets = projectMember.project.assets;

    // 2️⃣ Extract assets by type
    const designAsset = assets.find(
      (a) => a.type.toLowerCase() === "design"
    );

    const previewAsset = assets.find(
      (a) => a.type.toLowerCase() === "preview"
    );

    return NextResponse.json({
      success: true,
      data: {
        design: designAsset
          ? {
              title: designAsset.title,
              imageUrl: designAsset.url,
            }
          : null,

        preview: previewAsset
          ? {
              title: previewAsset.title,
              imageUrl: previewAsset.url,
              liveUrl: previewAsset.liveUrl,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Design preview API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const projectId = formData.get("projectId") as string;
    const type = formData.get("type") as string; // "design" or "preview"
    const title = formData.get("title") as string;
    const uploadedBy = formData.get("uploadedBy") as string;
    const file = formData.get("file") as File;
    const liveUrl = formData.get("liveUrl") as string; // For preview type

    if (!projectId || !type || !title) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let cloudinaryUrl = null;
    let publicId = null;

    // Upload image to Cloudinary if file provided
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: `projects/${projectId}/${type}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      }) as any;

      cloudinaryUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    // Save to database
    const asset = await db.asset.create({
      data: {
        type,
        url: cloudinaryUrl || "",
        title,
        uploadedBy,
        projectId,
        publicId,
        liveUrl: type === "preview" ? liveUrl : null,
      },
    });

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
