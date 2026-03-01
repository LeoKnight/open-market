import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

const ALLOWED_BUCKETS = new Set(
  (process.env.S3_BUCKET || "open-market").split(",").map((b) => b.trim())
);

function isPathSafe(segments: string[]): boolean {
  return segments.every(
    (seg) => seg !== ".." && seg !== "." && !seg.includes("\\") && seg.length > 0
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const [bucket, ...rest] = path;

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isPathSafe(rest)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const key = rest.join("/");

  try {
    const response = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const body = await response.Body?.transformToByteArray();
    if (!body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(body), {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
