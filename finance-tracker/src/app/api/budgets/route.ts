import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgets, categories, transactions } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { budgetSchema } from "@/lib/validation";

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const month = Number(url.searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(url.searchParams.get("year")) || new Date().getFullYear();

  const rows = await db
    .select({
      id: budgets.id,
      name: budgets.name,
      amount: budgets.amount,
      month: budgets.month,
      year: budgets.year,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(and(eq(budgets.userId, auth.userId), eq(budgets.month, month), eq(budgets.year, year)));

  const { from, to } = monthRange(year, month);

  const withSpent = await Promise.all(
    rows.map(async (b) => {
      const conditions = [
        eq(transactions.userId, auth.userId),
        eq(transactions.type, "expense" as const),
      ];
      const txns = await db
        .select({ amount: transactions.amount, categoryId: transactions.categoryId, date: transactions.date })
        .from(transactions)
        .where(and(...conditions));

      const spent = txns
        .filter((t) => t.date >= from && t.date <= to && (!b.categoryId || t.categoryId === b.categoryId))
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...b, spent, remaining: b.amount - spent, percentUsed: b.amount > 0 ? (spent / b.amount) * 100 : 0 };
    })
  );

  return NextResponse.json(withSpent);
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db.insert(budgets).values({ ...parsed.data, userId: auth.userId }).returning();
  return NextResponse.json(row, { status: 201 });
}
