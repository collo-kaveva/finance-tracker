import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { generateInsights } from "@/lib/spending-analytics";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const insights = await generateInsights(auth.userId);
  return NextResponse.json({ insights });
}
