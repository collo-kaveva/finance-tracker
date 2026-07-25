import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUserId } from "@/lib/session";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, auth.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}

export async function PATCH() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, auth.userId));
  return NextResponse.json({ ok: true });
}
