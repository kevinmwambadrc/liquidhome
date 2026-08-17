import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Pre-allocate a 1MB uncompressible random buffer pool to avoid CPU bottlenecks
const CHUNK_SIZE = 1024 * 1024; // 1MB
const BUFFER_POOL = crypto.randomBytes(CHUNK_SIZE);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // Target total bytes to stream (default: 15MB per request, client can request more or loop)
  const bytesParam = parseInt(url.searchParams.get("bytes") || "15728640", 10);
  const totalBytes = Math.min(Math.max(bytesParam, 1024 * 128), 50 * 1024 * 1024); // between 128KB and 50MB

  let bytesSent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= totalBytes) {
        controller.close();
        return;
      }
      const remaining = totalBytes - bytesSent;
      const thisChunkSize = Math.min(remaining, CHUNK_SIZE);
      const chunk = BUFFER_POOL.subarray(0, thisChunkSize);
      controller.enqueue(chunk);
      bytesSent += thisChunkSize;
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": totalBytes.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
