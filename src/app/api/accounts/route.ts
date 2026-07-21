import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { financeAccounts } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { accountSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const rows = await db.select().from(financeAccounts).where(eq(financeAccounts.userId, auth.userId));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db.insert(financeAccounts).values({ ...parsed.data, userId: auth.userId }).returning();
  return NextResponse.json(row, { status: 201 });
}
