import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const equipments = await db.equipment.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ ok: true, equipments });
}
