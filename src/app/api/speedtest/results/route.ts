import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  try {
    const results = await db.speedTestResult.findMany({
      where: user ? { userId: user.id } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const aggregates = await db.speedTestResult.aggregate({
      _avg: {
        downloadMbps: true,
        uploadMbps: true,
        ping: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      results,
      stats: {
        totalTests: aggregates._count.id,
        avgDownload: Number((aggregates._avg.downloadMbps || 0).toFixed(1)),
        avgUpload: Number((aggregates._avg.uploadMbps || 0).toFixed(1)),
        avgPing: Number((aggregates._avg.ping || 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Speedtest results fetch error:", error);
    return NextResponse.json({ ok: false, message: "Error fetching results" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const ping = Number(body?.ping) || 0;
    const jitter = Number(body?.jitter) || 0;
    const downloadMbps = Number(body?.downloadMbps) || 0;
    const uploadMbps = Number(body?.uploadMbps) || 0;
    const server = (body?.server ?? "Liquid Home Kinshasa Core").toString();
    const clientIp = (body?.clientIp ?? "197.234.218.42").toString();
    const isp = (body?.isp ?? "Liquid Intelligent Technologies RDC").toString();
    const rating = (body?.rating ?? "good").toString();

    const created = await db.speedTestResult.create({
      data: {
        userId: user?.id ?? null,
        ping,
        jitter,
        downloadMbps,
        uploadMbps,
        server,
        clientIp,
        isp,
        rating,
      },
    });

    return NextResponse.json({
      ok: true,
      result: created,
    });
  } catch (error) {
    console.error("Speedtest save error:", error);
    return NextResponse.json({ ok: false, message: "Error saving result" }, { status: 500 });
  }
}
