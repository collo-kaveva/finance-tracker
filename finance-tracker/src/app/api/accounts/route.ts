import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { financeAccounts, transactions } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { accountSchema } from "@/lib/validation";
import { maskAccountNumber, randomAccountNumber, type AccountType } from "@/lib/account-meta";

export async function GET() {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const accounts = await db.select().from(financeAccounts).where(eq(financeAccounts.userId, auth.userId));
  const txns = await db
    .select({ accountId: transactions.accountId, amount: transactions.amount, type: transactions.type })
    .from(transactions)
    .where(eq(transactions.userId, auth.userId));

  const withStats = accounts.map((a) => {
    const own = txns.filter((t) => t.accountId === a.id);
    const totalSpending = own.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = own.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    return {
      ...a,
      totalTransactions: own.length,
      totalSpending,
      totalIncome,
      balance: totalIncome - totalSpending,
    };
  });

  return NextResponse.json(withStats);
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  // Simulate a real "connect" flow — a real integration would redirect to
  // the provider's OAuth/linking screen here and receive account details
  // back via webhook or callback. We synthesize the same shape of data.
  const accountNumber =
    parsed.data.accountNumber?.trim() || randomAccountNumber(parsed.data.type as AccountType);

  if (parsed.data.isDefault) {
    await db.update(financeAccounts).set({ isDefault: false }).where(eq(financeAccounts.userId, auth.userId));
  }

  const [row] = await db
    .insert(financeAccounts)
    .values({
      userId: auth.userId,
      type: parsed.data.type,
      provider: parsed.data.provider,
      accountName: parsed.data.accountName,
      accountNumber: maskAccountNumber(accountNumber, parsed.data.type as AccountType),
      currency: parsed.data.currency,
      isDefault: parsed.data.isDefault,
      isTrackingEnabled: parsed.data.isTrackingEnabled,
      status: "connected",
      lastSynced: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json({ ...row, totalTransactions: 0, totalSpending: 0, totalIncome: 0, balance: 0 }, { status: 201 });
}
