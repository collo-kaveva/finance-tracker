import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, transactions, budgets } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { categorySchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await req.json();
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db
    .update(categories)
    .set(parsed.data)
    .where(and(eq(categories.id, id), eq(categories.userId, auth.userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const inUse = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(and(eq(transactions.categoryId, id), eq(transactions.userId, auth.userId)))
    .limit(1);

  if (inUse.length > 0) {
    return NextResponse.json(
      { error: "This category has transactions attached. Reassign or delete them first." },
      { status: 409 }
    );
  }

  await db.delete(budgets).where(and(eq(budgets.categoryId, id), eq(budgets.userId, auth.userId)));
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, auth.userId)));

  return NextResponse.json({ ok: true });
}
