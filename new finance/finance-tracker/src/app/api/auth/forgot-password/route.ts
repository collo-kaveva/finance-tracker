import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { requestResetSchema } from "@/lib/validation";
import { getUserByEmail } from "@/db/queries/users";

// In a production app this would email the reset link. Here we return the
// token directly in the response so the flow is testable without an SMTP
// provider configured — the UI surfaces it as a "dev mode" link.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = requestResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const user = await getUserByEmail(parsed.data.email);
  if (!user) {
    // Don't reveal whether the account exists.
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

  return NextResponse.json({ ok: true, devResetLink: `/reset-password?token=${token}` });
}
