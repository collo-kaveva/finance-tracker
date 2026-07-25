import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories, budgets, financeAccounts } from "@/db/schema";
import { monthRange } from "@/lib/reports";

export interface TxnLite {
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryId: string;
  categoryName: string | null;
  accountId: string | null;
  accountType: "bank" | "paypal" | "mpesa" | null;
}

export const ACCOUNT_TYPE_LABEL: Record<string, string> = { bank: "Bank", paypal: "PayPal", mpesa: "M-Pesa" };

// ---- Pure aggregation functions (unit-testable, no I/O) ----

export function sumByDay(txns: TxnLite[]) {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    map.set(t.date, (map.get(t.date) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function sumByWeek(txns: TxnLite[]) {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([weekStart, total]) => ({ weekStart, total }))
    .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1));
}

export function sumByMonth(txns: TxnLite[]) {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const key = t.date.slice(0, 7); // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

export function sumByPaymentMethod(txns: TxnLite[]) {
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const key = t.accountType ?? "unassigned";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries()).map(([accountType, total]) => ({ accountType, total }));
}

export function sumByCategory(txns: TxnLite[]) {
  const map = new Map<string, { name: string; total: number }>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const existing = map.get(t.categoryId);
    if (existing) existing.total += t.amount;
    else map.set(t.categoryId, { name: t.categoryName ?? "Other", total: t.amount });
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

// ---- Data loading + insight generation (I/O) ----

async function loadTxns(userId: string): Promise<TxnLite[]> {
  return db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      accountId: transactions.accountId,
      accountType: financeAccounts.type,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(financeAccounts, eq(transactions.accountId, financeAccounts.id))
    .where(eq(transactions.userId, userId));
}

export interface Insight {
  text: string;
  tone: "info" | "warning" | "positive";
}

/** Generates the human-readable insight strings described in the spec, e.g.
 * "You have spent 82% of your Food budget." */
export async function generateInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];
  const now = new Date();
  const txns = await loadTxns(userId);

  const { from: curFrom, to: curTo } = monthRange(now.getFullYear(), now.getMonth() + 1);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { from: prevFrom, to: prevTo } = monthRange(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);

  const currentTxns = txns.filter((t) => t.date >= curFrom && t.date <= curTo);
  const prevTxns = txns.filter((t) => t.date >= prevFrom && t.date <= prevTo);

  // Budget-based insights
  const monthBudgets = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.year, now.getFullYear()), eq(budgets.month, now.getMonth() + 1)));

  for (const b of monthBudgets) {
    const spent = currentTxns
      .filter((t) => t.type === "expense" && (!b.categoryId || t.categoryId === b.categoryId))
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    if (pct >= 50) {
      const label = b.name.toLowerCase().includes("budget") ? b.name : `${b.name} budget`;
      insights.push({
        text: `You have spent ${Math.round(pct)}% of your ${label}.`,
        tone: pct >= 90 ? "warning" : "info",
      });
    }
  }

  // Payment-method month-over-month change
  const curByMethod = sumByPaymentMethod(currentTxns);
  const prevByMethod = sumByPaymentMethod(prevTxns);
  for (const c of curByMethod) {
    if (c.accountType === "unassigned") continue;
    const prev = prevByMethod.find((p) => p.accountType === c.accountType);
    const label = ACCOUNT_TYPE_LABEL[c.accountType] ?? c.accountType;
    if (prev && prev.total > 0) {
      const change = ((c.total - prev.total) / prev.total) * 100;
      if (Math.abs(change) >= 20) {
        insights.push({
          text: `Your ${label} spending ${change > 0 ? "increased" : "decreased"} by ${Math.abs(Math.round(change))}% compared to last month.`,
          tone: change > 0 ? "warning" : "positive",
        });
      }
    }
  }

  // Dominant payment method
  const totalExpense = curByMethod.reduce((s, m) => s + m.total, 0);
  const top = [...curByMethod].sort((a, b) => b.total - a.total)[0];
  if (top && totalExpense > 0 && top.accountType !== "unassigned") {
    const pct = (top.total / totalExpense) * 100;
    if (pct >= 50) {
      const label = ACCOUNT_TYPE_LABEL[top.accountType] ?? top.accountType;
      insights.push({ text: `Most of your expenses come from ${label} transactions.`, tone: "info" });
    }
  }

  return insights;
}
