// app/api/upload/route.ts
// Server-side upload handler — S3 credentials never reach the browser.
// POST /api/upload  (multipart/form-data, field name: "file")
// Returns: { url: string }  — URL is a standard amazonaws.com URL the backend accepts.

import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// ─── S3 client ────────────────────────────────────────────────────────────────
// Uses AWS_REGION + real AWS credentials so the public URL is *.amazonaws.com
// which passes the backend's IMAGE_URL_NOT_S3 validation.

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: jpeg, png, webp`,
        },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10MB` },
        { status: 400 },
      );
    }

    // ── Build a unique, organised key ─────────────────────────────────────────
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `products/${randomUUID()}.${ext}`;

    // ── Upload ────────────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // Objects must be publicly readable so the backend (and users) can fetch them
        ACL: "public-read",
      }),
    );

    // ── Return the standard virtual-hosted AWS URL ────────────────────────────
    // Format: https://<bucket>.s3.<region>.amazonaws.com/<key>
    // This is what the backend's IMAGE_URL_NOT_S3 validator expects.
    const region = process.env.AWS_REGION!;
    const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (err: any) {
    console.error("[/api/upload] S3 upload error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 },
    );
  }
}