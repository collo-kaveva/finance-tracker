import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bills } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { billSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const rows = await db.select().from(bills).where(eq(bills.userId, auth.userId));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const body = await req.json();
  const parsed = billSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const [row] = await db.insert(bills).values({ ...parsed.data, userId: auth.userId }).returning();
  return NextResponse.json(row, { status: 201 });
}
