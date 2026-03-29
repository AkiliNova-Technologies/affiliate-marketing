import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Environment variable validation
if (!process.env.AWS_REGION) throw new Error("Missing AWS_REGION");
if (!process.env.AWS_ACCESS_KEY_ID) throw new Error("Missing AWS_ACCESS_KEY_ID");
if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("Missing AWS_SECRET_ACCESS_KEY");
if (!process.env.AWS_ENDPOINT_URL) throw new Error("Missing AWS_ENDPOINT_URL");
if (!process.env.BUCKET_NAME) throw new Error("Missing BUCKET_NAME");

// :white_check_mark: S3 Client now points to Tigris via endpoint
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  endpoint: process.env.AWS_ENDPOINT_URL!,        // :white_check_mark: Added - points to Tigris
  forcePathStyle: true,                            // :white_check_mark: Added - required for non-AWS S3
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.BUCKET_NAME!;          // :white_check_mark: Fixed - was S3_BUCKET_NAME
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: jpeg, png, webp` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `products/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      })
    );

    // :white_check_mark: Fixed - URL now built from Tigris endpoint, not hardcoded AWS format
    const url = `${process.env.AWS_ENDPOINT_URL}/${BUCKET}/${key}`;
    // const url = `${process.env.AWS_ENDPOINT_URL}/${key}`;

    return NextResponse.json({ url }, { status: 201 });

  } catch (err: any) {
    console.error("[UPLOAD_ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}