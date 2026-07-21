import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { budgets, transactions, notifications, categories } from "@/db/schema";
import type { Transaction } from "@/db/schema";

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

/** Recomputes budget usage for the month a transaction falls in and raises
 * budget_nearing / budget_exceeded notifications, avoiding duplicates for
 * the same budget + threshold within the same month. */
export async function checkAndCreateBudgetNotifications(userId: string, dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const { from, to } = monthRange(year, month);

  const userBudgets = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.year, year), eq(budgets.month, month)));

  for (const budget of userBudgets) {
    const conditions = [
      eq(transactions.userId, userId),
      eq(transactions.type, "expense" as const),
      gte(transactions.date, from),
      lte(transactions.date, to),
    ];
    if (budget.categoryId) conditions.push(eq(transactions.categoryId, budget.categoryId));

    const rows = await db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(and(...conditions));

    const spent = rows.reduce((sum, r) => sum + r.amount, 0);
    const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    const marker = `budget:${budget.id}:${year}-${month}`;

    if (pct >= 100) {
      const exists = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.title, `Budget exceeded — ${budget.name}`)))
        .limit(1);
      if (exists.length === 0) {
        await db.insert(notifications).values({
          userId,
          type: "budget_exceeded",
          title: `Budget exceeded — ${budget.name}`,
          message: `You've spent past your ${budget.name} budget for this month. [${marker}]`,
        });
      }
    } else if (pct >= 90) {
      const exists = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.title, `Nearing budget limit — ${budget.name}`)))
        .limit(1);
      if (exists.length === 0) {
        await db.insert(notifications).values({
          userId,
          type: "budget_nearing",
          title: `Nearing budget limit — ${budget.name}`,
          message: `You've used ${Math.round(pct)}% of your ${budget.name} budget this month. [${marker}]`,
        });
      }
    }
  }
}

export async function maybeCreateLargeExpenseNotification(userId: string, txn: Transaction) {
  const LARGE_EXPENSE_THRESHOLD = 500;
  if (txn.amount < LARGE_EXPENSE_THRESHOLD) return;

  const [category] = await db.select().from(categories).where(eq(categories.id, txn.categoryId)).limit(1);

  await db.insert(notifications).values({
    userId,
    type: "large_expense",
    title: "Large expense recorded",
    message: `${txn.title} for ${txn.amount.toFixed(2)}${category ? ` in ${category.name}` : ""} was just logged.`,
  });
}
