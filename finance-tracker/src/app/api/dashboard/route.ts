import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getDashboardSummary } from "@/lib/reports";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
  const month = Number(url.searchParams.get("month")) || new Date().getMonth() + 1;

  const summary = await getDashboardSummary(auth.userId, year, month);
  return NextResponse.json(summary);
}
