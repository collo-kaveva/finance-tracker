import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { categories, users } from "@/db/schema";
import { signupSchema } from "@/lib/validation";
import { getUserByEmail } from "@/db/queries/users";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, currency } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ name, email: email.toLowerCase(), passwordHash, currency })
    .returning();

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({
      userId: user.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      type: c.type,
    }))
  );

  return NextResponse.json({ ok: true });
}
