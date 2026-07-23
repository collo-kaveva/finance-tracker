import { NextResponse } from "next/server";
import { and, asc, desc, eq, gte, lte, like, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories, financeAccounts } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { transactionSchema } from "@/lib/validation";
import { checkAndCreateBudgetNotifications, maybeCreateLargeExpenseNotification, checkPaymentMethodConcentration, checkUnusualSpending } from "@/lib/notifications";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const type = url.searchParams.get("type");
  const categoryId = url.searchParams.get("categoryId");
  const accountId = url.searchParams.get("accountId");
  const paymentMethod = url.searchParams.get("paymentMethod");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const amountMin = url.searchParams.get("amountMin");
  const amountMax = url.searchParams.get("amountMax");
  const sortBy = url.searchParams.get("sortBy") || "date";
  const sortDir = url.searchParams.get("sortDir") || "desc";
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = Number(url.searchParams.get("pageSize") || "20");

  const conditions: SQL[] = [eq(transactions.userId, auth.userId)];
  if (type === "income" || type === "expense") conditions.push(eq(transactions.type, type));
  if (categoryId) conditions.push(eq(transactions.categoryId, categoryId));
  if (accountId) conditions.push(eq(transactions.accountId, accountId));
  if (paymentMethod) {
    conditions.push(
      eq(
        transactions.paymentMethod,
        paymentMethod as "cash" | "card" | "bank_transfer" | "upi" | "other"
      )
    );
  }
  if (dateFrom) conditions.push(gte(transactions.date, dateFrom));
  if (dateTo) conditions.push(lte(transactions.date, dateTo));
  if (amountMin) conditions.push(gte(transactions.amount, Number(amountMin)));
  if (amountMax) conditions.push(lte(transactions.amount, Number(amountMax)));
  if (q) {
    const term = `%${q}%`;
    conditions.push(
      or(like(transactions.title, term), like(transactions.notes, term)) as SQL
    );
  }

  const sortColumn =
    sortBy === "amount" ? transactions.amount :
    sortBy === "title" ? transactions.title :
    transactions.date;
  const orderFn = sortDir === "asc" ? asc : desc;

  const all = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      paymentMethod: transactions.paymentMethod,
      notes: transactions.notes,
      date: transactions.date,
      receiptUrl: transactions.receiptUrl,
      isRecurring: transactions.isRecurring,
      recurrenceInterval: transactions.recurrenceInterval,
      accountId: transactions.accountId,
      accountType: financeAccounts.type,
      accountName: financeAccounts.accountName,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(financeAccounts, eq(transactions.accountId, financeAccounts.id))
    .where(and(...conditions))
    .orderBy(orderFn(sortColumn));

  const total = all.length;
  const start = (page - 1) * pageSize;
  const pageRows = all.slice(start, start + pageSize);

  return NextResponse.json({ data: pageRows, total, page, pageSize });
}

export async function POST(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [row] = await db
    .insert(transactions)
    .values({ ...parsed.data, userId: auth.userId })
    .returning();

  if (parsed.data.type === "expense") {
    await checkAndCreateBudgetNotifications(auth.userId, parsed.data.date);
    await maybeCreateLargeExpenseNotification(auth.userId, row);
    await checkUnusualSpending(auth.userId, parsed.data.date);
    await checkPaymentMethodConcentration(auth.userId);
  }

  return NextResponse.json(row, { status: 201 });
}
