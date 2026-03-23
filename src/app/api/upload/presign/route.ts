import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/r2";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { filename, contentType } = body;

  if (!filename || typeof filename !== "string") {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }

  if (!contentType || typeof contentType !== "string") {
    return NextResponse.json({ error: "contentType is required" }, { status: 400 });
  }

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Only image file types are allowed" }, { status: 400 });
  }

  const userId = session.user.id;
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${userId}/${timestamp}-${sanitizedFilename}`;

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  const publicUrl = process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/${key}` : null;

  return NextResponse.json({ uploadUrl, key, publicUrl });
}
