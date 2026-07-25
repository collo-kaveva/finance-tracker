import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { financeAccounts, transactions } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { accountSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await req.json();

  // Lightweight actions that don't require full validation
  if (body.action === "sync") {
    const [row] = await db
      .update(financeAccounts)
      .set({ lastSynced: new Date().toISOString(), status: "connected", updatedAt: new Date().toISOString() })
      .where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  if (body.action === "disconnect" || body.action === "reconnect") {
    const [row] = await db
      .update(financeAccounts)
      .set({
        status: body.action === "disconnect" ? "disconnected" : "connected",
        lastSynced: body.action === "reconnect" ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  if (body.action === "setDefault") {
    await db.update(financeAccounts).set({ isDefault: false }).where(eq(financeAccounts.userId, auth.userId));
    const [row] = await db
      .update(financeAccounts)
      .set({ isDefault: true, updatedAt: new Date().toISOString() })
      .where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  if (typeof body.isTrackingEnabled === "boolean" && Object.keys(body).length === 1) {
    const [row] = await db
      .update(financeAccounts)
      .set({ isTrackingEnabled: body.isTrackingEnabled, updatedAt: new Date().toISOString() })
      .where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  // Full edit
  const parsed = accountSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await db.update(financeAccounts).set({ isDefault: false }).where(eq(financeAccounts.userId, auth.userId));
  }

  const [row] = await db
    .update(financeAccounts)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  // Detach transactions rather than blocking deletion — their history stays intact.
  await db.update(transactions).set({ accountId: null }).where(and(eq(transactions.accountId, id), eq(transactions.userId, auth.userId)));
  await db.delete(financeAccounts).where(and(eq(financeAccounts.id, id), eq(financeAccounts.userId, auth.userId)));
  return NextResponse.json({ ok: true });
}
