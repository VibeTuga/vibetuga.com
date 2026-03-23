import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const downloadUrl = await getPresignedDownloadUrl(key);

  return NextResponse.redirect(downloadUrl);
}
