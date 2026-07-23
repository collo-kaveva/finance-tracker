import bcrypt from "bcryptjs";
import { db, sqlite } from "./index";
import {
  users, categories, transactions, budgets, financeAccounts,
  savingsGoals, bills, notifications,
} from "./schema";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

const EXPENSE_TITLES: Record<string, { title: string; range: [number, number] }[]> = {
  Food: [
    { title: "Grocery run — Whole Foods", range: [35, 140] },
    { title: "Lunch with colleagues", range: [12, 35] },
    { title: "Coffee shop", range: [4, 9] },
    { title: "Dinner takeout", range: [18, 55] },
    { title: "Farmers market", range: [15, 45] },
  ],
  Transport: [
    { title: "Uber ride", range: [8, 32] },
    { title: "Fuel top-up", range: [30, 70] },
    { title: "Monthly transit pass", range: [60, 90] },
    { title: "Parking", range: [5, 20] },
  ],
  Shopping: [
    { title: "Amazon order", range: [15, 120] },
    { title: "New sneakers", range: [45, 130] },
    { title: "Home essentials", range: [20, 80] },
    { title: "Electronics accessory", range: [10, 60] },
  ],
  Entertainment: [
    { title: "Movie night", range: [12, 40] },
    { title: "Streaming subscription", range: [9, 18] },
    { title: "Concert tickets", range: [40, 150] },
    { title: "Video game purchase", range: [15, 60] },
  ],
  Bills: [
    { title: "Electricity bill", range: [40, 110] },
    { title: "Internet bill", range: [45, 70] },
    { title: "Phone bill", range: [30, 60] },
    { title: "Water bill", range: [15, 35] },
  ],
  Healthcare: [
    { title: "Pharmacy", range: [10, 45] },
    { title: "Doctor visit copay", range: [20, 90] },
    { title: "Gym membership", range: [25, 55] },
  ],
  Rent: [{ title: "Monthly rent", range: [700, 1600] }],
  Education: [
    { title: "Online course", range: [15, 90] },
    { title: "Textbooks", range: [20, 120] },
  ],
  Other: [
    { title: "Miscellaneous expense", range: [8, 45] },
    { title: "Gift for a friend", range: [15, 60] },
  ],
};

const INCOME_TITLES: Record<string, { title: string; range: [number, number] }[]> = {
  Salary: [{ title: "Monthly salary", range: [2200, 4200] }],
  Investments: [
    { title: "Dividend payout", range: [15, 120] },
    { title: "Stock sale profit", range: [50, 400] },
  ],
  Gifts: [{ title: "Birthday gift received", range: [30, 200] }],
};

async function main() {
  console.log("Seeding database…");

  const demoEmail = "demo@ledger.app";

  // Wipe any existing data so this script is safe to re-run.
  sqlite.exec(`
    DELETE FROM notifications;
    DELETE FROM bills;
    DELETE FROM savings_goals;
    DELETE FROM budgets;
    DELETE FROM transactions;
    DELETE FROM finance_accounts;
    DELETE FROM categories;
    DELETE FROM password_reset_tokens;
    DELETE FROM users;
  `);

  const passwordHash = await bcrypt.hash("demodemo", 10);
  const [user] = await db
    .insert(users)
    .values({ name: "Amara Okafor", email: demoEmail, passwordHash, currency: "USD" })
    .returning();

  const categoryRows = await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((c) => ({ userId: user.id, name: c.name, color: c.color, icon: c.icon, type: c.type })))
    .returning();

  const catByName = new Map(categoryRows.map((c) => [c.name, c]));

  const accountRows = await db
    .insert(financeAccounts)
    .values([
      {
        userId: user.id, type: "bank" as const, provider: "Equity Bank", accountName: "Everyday Checking",
        accountNumber: "•••• •••• 4821", currency: "USD", status: "connected" as const,
        isDefault: true, isTrackingEnabled: true, lastSynced: new Date().toISOString(),
      },
      {
        userId: user.id, type: "bank" as const, provider: "KCB Bank", accountName: "Savings Account",
        accountNumber: "•••• •••• 1190", currency: "USD", status: "connected" as const,
        isDefault: false, isTrackingEnabled: true, lastSynced: new Date().toISOString(),
      },
      {
        userId: user.id, type: "paypal" as const, provider: "PayPal", accountName: "PayPal Wallet",
        accountNumber: "amara.ok@email.com", currency: "USD", status: "connected" as const,
        isDefault: false, isTrackingEnabled: true, lastSynced: new Date().toISOString(),
      },
      {
        userId: user.id, type: "mpesa" as const, provider: "Safaricom M-Pesa", accountName: "M-Pesa",
        accountNumber: "•••• 234", currency: "USD", status: "connected" as const,
        isDefault: false, isTrackingEnabled: true, lastSynced: new Date().toISOString(),
      },
    ])
    .returning();

  const [checkingAcct, savingsAcct, paypalAcct, mpesaAcct] = accountRows;

  // Weighted account picker for everyday spending: bank is used most often,
  // M-Pesa moderately, PayPal for subscriptions/online purchases.
  function pickAccountForCategory(catName: string) {
    if (catName === "Bills" || catName === "Healthcare") return pick([checkingAcct, checkingAcct, savingsAcct]);
    if (catName === "Entertainment" || catName === "Shopping") return pick([paypalAcct, paypalAcct, checkingAcct, mpesaAcct]);
    if (catName === "Food" || catName === "Transport") return pick([mpesaAcct, mpesaAcct, mpesaAcct, checkingAcct]);
    return pick([checkingAcct, mpesaAcct, paypalAcct, savingsAcct]);
  }

  const paymentMethods = ["cash", "card", "bank_transfer", "upi", "other"] as const;

  const now = new Date();
  const txnValues: (typeof transactions.$inferInsert)[] = [];

  // 6 months of history, including the current month
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const isCurrentMonth = monthsAgo === 0;
    const cappedDays = isCurrentMonth ? Math.min(daysInMonth, now.getDate()) : daysInMonth;

    // Salary income — once a month
    const salaryCat = catByName.get("Salary")!;
    const salaryDay = Math.min(1, cappedDays);
    txnValues.push({
      userId: user.id,
      title: "Monthly salary",
      amount: Math.round(randomBetween(2800, 3600) * 100) / 100,
      type: "income",
      categoryId: salaryCat.id,
      accountId: checkingAcct.id,
      paymentMethod: "bank_transfer",
      notes: null,
      date: dateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), salaryDay)),
      isRecurring: true,
      recurrenceInterval: "monthly",
    });

    // Occasional extra income (investments / gifts)
    if (Math.random() > 0.5) {
      const incomeCatName = pick(["Investments", "Gifts"]);
      const incomeCat = catByName.get(incomeCatName)!;
      const opt = pick(INCOME_TITLES[incomeCatName]);
      txnValues.push({
        userId: user.id,
        title: opt.title,
        amount: Math.round(randomBetween(opt.range[0], opt.range[1]) * 100) / 100,
        type: "income",
        categoryId: incomeCat.id,
        accountId: checkingAcct.id,
        paymentMethod: "bank_transfer",
        notes: null,
        date: dateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(Math.ceil(randomBetween(2, cappedDays)), cappedDays))),
        isRecurring: false,
        recurrenceInterval: null,
      });
    }

    // Rent — once a month
    const rentCat = catByName.get("Rent")!;
    txnValues.push({
      userId: user.id,
      title: "Monthly rent",
      amount: Math.round(randomBetween(900, 1400) * 100) / 100,
      type: "expense",
      categoryId: rentCat.id,
      accountId: checkingAcct.id,
      paymentMethod: "bank_transfer",
      notes: null,
      date: dateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(3, cappedDays))),
      isRecurring: true,
      recurrenceInterval: "monthly",
    });

    // Bills — a handful each month
    for (const billTitle of ["Electricity bill", "Internet bill", "Phone bill"]) {
      const billsCat = catByName.get("Bills")!;
      const opt = EXPENSE_TITLES.Bills.find((o) => o.title === billTitle)!;
      txnValues.push({
        userId: user.id,
        title: opt.title,
        amount: Math.round(randomBetween(opt.range[0], opt.range[1]) * 100) / 100,
        type: "expense",
        categoryId: billsCat.id,
        accountId: checkingAcct.id,
        paymentMethod: "card",
        notes: null,
        date: dateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(Math.ceil(randomBetween(5, 20)), cappedDays))),
        isRecurring: true,
        recurrenceInterval: "monthly",
      });
    }

    // Everyday spending across Food, Transport, Shopping, Entertainment, Healthcare, Education, Other
    const everydayCats = ["Food", "Transport", "Shopping", "Entertainment", "Healthcare", "Education", "Other"];
    const spendCount = isCurrentMonth ? Math.round(cappedDays * 0.7) : Math.round(daysInMonth * 0.9);

    for (let i = 0; i < spendCount; i++) {
      const catName = pick(everydayCats);
      const cat = catByName.get(catName)!;
      const opt = pick(EXPENSE_TITLES[catName]);
      const day = Math.max(1, Math.min(Math.ceil(randomBetween(1, cappedDays)), cappedDays));
      txnValues.push({
        userId: user.id,
        title: opt.title,
        amount: Math.round(randomBetween(opt.range[0], opt.range[1]) * 100) / 100,
        type: "expense",
        categoryId: cat.id,
        accountId: pickAccountForCategory(catName).id,
        paymentMethod: pick(paymentMethods),
        notes: Math.random() > 0.8 ? "Logged from mobile" : null,
        date: dateStr(new Date(monthDate.getFullYear(), monthDate.getMonth(), day)),
        isRecurring: false,
        recurrenceInterval: null,
      });
    }
  }

  // Insert in batches
  for (let i = 0; i < txnValues.length; i += 50) {
    await db.insert(transactions).values(txnValues.slice(i, i + 50));
  }

  // Budgets for the current month
  const budgetTargets: { category: string; amount: number }[] = [
    { category: "Food", amount: 500 },
    { category: "Transport", amount: 200 },
    { category: "Shopping", amount: 250 },
    { category: "Entertainment", amount: 120 },
    { category: "Bills", amount: 220 },
  ];
  await db.insert(budgets).values(
    budgetTargets.map((b) => ({
      userId: user.id,
      categoryId: catByName.get(b.category)!.id,
      name: `${b.category} budget`,
      amount: b.amount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }))
  );
  await db.insert(budgets).values({
    userId: user.id,
    categoryId: null,
    name: "Overall monthly budget",
    amount: 2200,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  // Savings goals
  await db.insert(savingsGoals).values([
    { userId: user.id, name: "Emergency fund", targetAmount: 5000, currentAmount: 1850, deadline: null },
    { userId: user.id, name: "Trip to Zanzibar", targetAmount: 1800, currentAmount: 620, deadline: dateStr(new Date(now.getFullYear(), now.getMonth() + 4, 1)) },
  ]);

  // Upcoming bills
  await db.insert(bills).values([
    { userId: user.id, title: "Internet bill", amount: 55, dueDate: dateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5)), isPaid: false, recurrenceInterval: "monthly" },
    { userId: user.id, title: "Car insurance", amount: 140, dueDate: dateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12)), isPaid: false, recurrenceInterval: "monthly" },
    { userId: user.id, title: "Annual domain renewal", amount: 18, dueDate: dateStr(new Date(now.getFullYear(), now.getMonth() + 1, 2)), isPaid: false, recurrenceInterval: "yearly" },
  ]);

  // A couple of sample notifications
  await db.insert(notifications).values([
    {
      userId: user.id,
      type: "monthly_summary",
      title: "Your monthly summary is ready",
      message: "Check the Reports tab to see how this month compared to last month.",
    },
    {
      userId: user.id,
      type: "upcoming_bill",
      title: "Upcoming bill — Internet bill",
      message: "Due in 5 days.",
    },
  ]);

  console.log(`Seed complete. Sign in with ${demoEmail} / demodemo`);
  console.log(`Inserted ${txnValues.length} transactions.`);
}

// Export seed function for programmatic use
export async function seed() {
  await main();
}

// Run directly if executed via CLI
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
