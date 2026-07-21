import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories, budgets, bills } from "@/db/schema";

export function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export async function getAllTransactionsWithCategory(userId: string) {
  return db
    .select({
      id: transactions.id,
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      paymentMethod: transactions.paymentMethod,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId));
}

export async function getDashboardSummary(userId: string, year: number, month: number) {
  const { from, to } = monthRange(year, month);
  const all = await getAllTransactionsWithCategory(userId);

  const thisMonth = all.filter((t) => t.date >= from && t.date <= to);
  const income = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;

  const totalIncomeAllTime = all.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenseAllTime = all.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

  const monthBudgets = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.year, year), eq(budgets.month, month)));

  const totalBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const remainingBudget = totalBudget - expenses;

  const byCategory = new Map<string, { name: string; color: string; total: number }>();
  for (const t of thisMonth.filter((t) => t.type === "expense")) {
    const key = t.categoryId;
    const existing = byCategory.get(key);
    if (existing) existing.total += t.amount;
    else byCategory.set(key, { name: t.categoryName ?? "Other", color: t.categoryColor ?? "#7a7a6e", total: t.amount });
  }
  const spendingByCategory = Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
  const highestCategory = spendingByCategory[0] ?? null;

  const recentTransactions = [...all]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const upcomingBills = await db
    .select()
    .from(bills)
    .where(and(eq(bills.userId, userId), eq(bills.isPaid, false), gte(bills.dueDate, today), lte(bills.dueDate, in30Days)));

  return {
    income,
    expenses,
    savings,
    totalBalance,
    totalBudget,
    remainingBudget,
    spendingByCategory,
    highestCategory,
    recentTransactions,
    upcomingBills,
    budgetCount: monthBudgets.length,
  };
}

export async function getMonthlyTrend(userId: string, monthsBack = 6) {
  const all = await getAllTransactionsWithCategory(userId);
  const now = new Date();
  const result: { label: string; income: number; expense: number; year: number; month: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const { from, to } = monthRange(year, month);
    const inRange = all.filter((t) => t.date >= from && t.date <= to);
    result.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      income: inRange.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: inRange.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      year,
      month,
    });
  }
  return result;
}
