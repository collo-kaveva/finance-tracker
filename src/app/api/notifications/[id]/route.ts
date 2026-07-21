import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUserId } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const [row] = await db
    .update(notifications)
    .set({ isRead: body.isRead ?? true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, auth.userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
