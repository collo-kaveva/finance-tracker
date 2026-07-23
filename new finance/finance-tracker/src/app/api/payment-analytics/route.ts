import { NextResponse } from "next/server";
import { and, eq, gte, lte, SQL } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories, financeAccounts } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { ACCOUNT_TYPE_LABEL } from "@/lib/spending-analytics";

const ACCOUNT_TYPES = ["bank", "paypal", "mpesa"] as const;

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId");
  const categoryId = url.searchParams.get("categoryId");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const amountMin = url.searchParams.get("amountMin");
  const amountMax = url.searchParams.get("amountMax");

  const conditions: SQL[] = [eq(transactions.userId, auth.userId)];
  if (accountId) conditions.push(eq(transactions.accountId, accountId));
  if (categoryId) conditions.push(eq(transactions.categoryId, categoryId));
  if (dateFrom) conditions.push(gte(transactions.date, dateFrom));
  if (dateTo) conditions.push(lte(transactions.date, dateTo));
  if (amountMin) conditions.push(gte(transactions.amount, Number(amountMin)));
  if (amountMax) conditions.push(lte(transactions.amount, Number(amountMax)));

  const rows = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      accountType: financeAccounts.type,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(financeAccounts, eq(transactions.accountId, financeAccounts.id))
    .where(and(...conditions));

  const expenses = rows.filter((r) => r.type === "expense");
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);

  const distribution = ACCOUNT_TYPES.map((type) => {
    const forType = expenses.filter((r) => r.accountType === type);
    const total = forType.reduce((s, r) => s + r.amount, 0);
    return {
      accountType: type,
      label: ACCOUNT_TYPE_LABEL[type],
      total,
      count: forType.length,
      percent: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
    };
  }).filter((d) => d.count > 0 || d.total > 0);

  // Monthly trend per account type, last 6 months
  const now = new Date();
  const monthlyTrend: { label: string; bank: number; paypal: number; mpesa: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const inMonth = expenses.filter((r) => r.date >= from && r.date <= to);
    monthlyTrend.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      bank: inMonth.filter((r) => r.accountType === "bank").reduce((s, r) => s + r.amount, 0),
      paypal: inMonth.filter((r) => r.accountType === "paypal").reduce((s, r) => s + r.amount, 0),
      mpesa: inMonth.filter((r) => r.accountType === "mpesa").reduce((s, r) => s + r.amount, 0),
    });
  }

  const top = [...distribution].sort((a, b) => b.total - a.total)[0] ?? null;

  return NextResponse.json({
    distribution,
    monthlyTrend,
    totalExpense,
    topMethod: top,
  });
}
