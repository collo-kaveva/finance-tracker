import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { budgets, transactions, notifications, categories, financeAccounts } from "@/db/schema";
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
    title: "Large expense detected",
    message: `${txn.title} for ${txn.amount.toFixed(2)}${category ? ` in ${category.name}` : ""} was just logged.`,
  });
}

/** Compares today's total spending against the trailing 30-day daily average
 * and raises a notification when today is a significant outlier. */
export async function checkUnusualSpending(userId: string, dateStr: string) {
  const today = dateStr;
  const windowStart = new Date(new Date(dateStr).getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const rows = await db
    .select({ amount: transactions.amount, date: transactions.date })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense" as const),
        gte(transactions.date, windowStart),
        lte(transactions.date, today)
      )
    );

  const todayTotal = rows.filter((r) => r.date === today).reduce((s, r) => s + r.amount, 0);
  const priorDays = new Set(rows.filter((r) => r.date !== today).map((r) => r.date));
  if (priorDays.size < 5) return; // not enough history to judge "unusual" yet

  const priorTotal = rows.filter((r) => r.date !== today).reduce((s, r) => s + r.amount, 0);
  const avgDaily = priorTotal / priorDays.size;

  if (avgDaily > 0 && todayTotal > avgDaily * 2.5 && todayTotal - avgDaily > 25) {
    const title = "Today's spending is unusually high";
    const exists = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.title, `${title} — ${today}`)))
      .limit(1);
    if (exists.length === 0) {
      await db.insert(notifications).values({
        userId,
        type: "large_expense",
        title: `${title} — ${today}`,
        message: `You've spent ${todayTotal.toFixed(2)} today, well above your recent daily average of ${avgDaily.toFixed(2)}.`,
      });
    }
  }
}

/** Flags when a single connected account type accounts for a large share of
 * this month's total expenses (default threshold: 70%). */
export async function checkPaymentMethodConcentration(userId: string, thresholdPct = 70) {
  const now = new Date();
  const { from, to } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const rows = await db
    .select({ amount: transactions.amount, accountId: transactions.accountId })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense" as const),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    );

  const total = rows.reduce((s, r) => s + r.amount, 0);
  if (total <= 0) return;

  const accounts = await db.select().from(financeAccounts).where(eq(financeAccounts.userId, userId));
  const byAccount = new Map<string, number>();
  for (const r of rows) {
    if (!r.accountId) continue;
    byAccount.set(r.accountId, (byAccount.get(r.accountId) ?? 0) + r.amount);
  }

  for (const [accountId, amount] of byAccount) {
    const pct = (amount / total) * 100;
    if (pct >= thresholdPct) {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) continue;
      const label = ACCOUNT_LABELS[account.type] ?? account.type;
      const title = `${label} is most of your spending`;
      const marker = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const exists = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.title, `${title} (${marker})`)))
        .limit(1);
      if (exists.length === 0) {
        await db.insert(notifications).values({
          userId,
          type: "large_expense",
          title: `${title} (${marker})`,
          message: `${Math.round(pct)}% of your expenses this month are coming from ${label} (${account.accountName}).`,
        });
      }
    }
  }
}

const ACCOUNT_LABELS: Record<string, string> = { bank: "Bank", paypal: "PayPal", mpesa: "M-Pesa" };
