import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { getAllTransactionsWithCategory, getMonthlyTrend, monthRange } from "@/lib/reports";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
  const month = url.searchParams.get("month") ? Number(url.searchParams.get("month")) : null;
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const all = await getAllTransactionsWithCategory(auth.userId);

  let rangeFrom: string;
  let rangeTo: string;
  if (dateFrom && dateTo) {
    rangeFrom = dateFrom;
    rangeTo = dateTo;
  } else if (month) {
    const r = monthRange(year, month);
    rangeFrom = r.from;
    rangeTo = r.to;
  } else {
    rangeFrom = `${year}-01-01`;
    rangeTo = `${year}-12-31`;
  }

  const inRange = all.filter((t) => t.date >= rangeFrom && t.date <= rangeTo);
  const expenses = inRange.filter((t) => t.type === "expense");
  const income = inRange.filter((t) => t.type === "income");

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, { name: string; color: string; total: number }>();
  for (const t of expenses) {
    const existing = byCategory.get(t.categoryId);
    if (existing) existing.total += t.amount;
    else byCategory.set(t.categoryId, { name: t.categoryName ?? "Other", color: t.categoryColor ?? "#7a7a6e", total: t.amount });
  }
  const spendingByCategory = Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
  const topCategories = spendingByCategory.slice(0, 5);

  const byDay = new Map<string, number>();
  for (const t of expenses) {
    byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount);
  }
  const dailySpending = Array.from(byDay.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const monthlyTrend = await getMonthlyTrend(auth.userId, 6);

  const currentMonth = month ?? new Date().getMonth() + 1;
  const budgetRows = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, auth.userId), eq(budgets.year, year), eq(budgets.month, currentMonth)));

  const budgetUtilization = budgetRows.map((b) => {
    const r = monthRange(year, currentMonth);
    const spent = all
      .filter((t) => t.type === "expense" && t.date >= r.from && t.date <= r.to && (!b.categoryId || t.categoryId === b.categoryId))
      .reduce((s, t) => s + t.amount, 0);
    return { name: b.name, budget: b.amount, spent, percentUsed: b.amount > 0 ? (spent / b.amount) * 100 : 0 };
  });

  const yearTxns = all.filter((t) => t.date >= `${year}-01-01` && t.date <= `${year}-12-31`);
  const yearlySummary = {
    year,
    totalIncome: yearTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    totalExpense: yearTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    transactionCount: yearTxns.length,
  };

  // Spending & income by payment method (connected account type)
  const ACCOUNT_LABELS: Record<string, string> = { bank: "Bank", paypal: "PayPal", mpesa: "M-Pesa" };
  const methodTypes = ["bank", "paypal", "mpesa"] as const;
  const paymentMethodBreakdown = methodTypes
    .map((type) => {
      const forType = inRange.filter((t) => t.accountType === type);
      return {
        accountType: type,
        label: ACCOUNT_LABELS[type],
        spending: forType.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        income: forType.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        transactionCount: forType.length,
      };
    })
    .filter((m) => m.transactionCount > 0);

  // This week vs. last week comparison
  const now2 = new Date();
  const startOfWeek = new Date(now2);
  startOfWeek.setDate(now2.getDate() - now2.getDay());
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const thisWeekExpense = all
    .filter((t) => t.type === "expense" && t.date >= iso(startOfWeek) && t.date <= iso(now2))
    .reduce((s, t) => s + t.amount, 0);
  const lastWeekExpense = all
    .filter((t) => t.type === "expense" && t.date >= iso(startOfLastWeek) && t.date <= iso(endOfLastWeek))
    .reduce((s, t) => s + t.amount, 0);

  const weeklyComparison = {
    thisWeek: thisWeekExpense,
    lastWeek: lastWeekExpense,
    changePercent: lastWeekExpense > 0 ? ((thisWeekExpense - lastWeekExpense) / lastWeekExpense) * 100 : null,
  };

  return NextResponse.json({
    range: { from: rangeFrom, to: rangeTo },
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    spendingByCategory,
    topCategories,
    dailySpending,
    monthlyTrend,
    budgetUtilization,
    yearlySummary,
    paymentMethodBreakdown,
    weeklyComparison,
    transactionCount: inRange.length,
  });
}
