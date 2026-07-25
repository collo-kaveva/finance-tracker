import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { transactionSchema } from "@/lib/validation";
import { checkAndCreateBudgetNotifications, checkUnusualSpending, checkPaymentMethodConcentration } from "@/lib/notifications";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, auth.userId)))
    .limit(1);

  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await req.json();
  const parsed = transactionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db
    .update(transactions)
    .set(parsed.data)
    .where(and(eq(transactions.id, id), eq(transactions.userId, auth.userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (row.type === "expense") {
    await checkAndCreateBudgetNotifications(auth.userId, row.date);
    await checkUnusualSpending(auth.userId, row.date);
    await checkPaymentMethodConcentration(auth.userId);
  }

  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, auth.userId)));
  return NextResponse.json({ ok: true });
}
