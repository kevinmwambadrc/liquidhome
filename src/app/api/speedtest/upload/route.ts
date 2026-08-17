import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let receivedBytes = 0;

  try {
    if (req.body) {
      const reader = req.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          receivedBytes += value.length;
        }
      }
    } else {
      const buffer = await req.arrayBuffer();
      receivedBytes = buffer.byteLength;
    }

    const durationMs = Math.max(1, Date.now() - startTime);

    return new NextResponse(
      JSON.stringify({
        ok: true,
        receivedBytes,
        durationMs,
        rateMbps: Number(((receivedBytes * 8) / (durationMs / 1000) / (1000 * 1000)).toFixed(2)),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Upload speed test error:", error);
    return NextResponse.json({ ok: false, message: "Upload failed" }, { status: 500 });
  }
}
