export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new ApiError(data?.error ?? "Something went wrong", res.status);
  }
  return data as T;
}

export interface CategoryDTO {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "income" | "expense";
}

export interface TransactionDTO {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  paymentMethod: "cash" | "card" | "bank_transfer" | "upi" | "other";
  notes: string | null;
  date: string;
  receiptUrl: string | null;
  isRecurring: boolean;
  recurrenceInterval: "weekly" | "monthly" | "yearly" | null;
  accountId: string | null;
  accountType: "bank" | "paypal" | "mpesa" | null;
  accountName: string | null;
  categoryId: string;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
}

export interface BudgetDTO {
  id: string;
  name: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface AccountDTO {
  id: string;
  type: "bank" | "paypal" | "mpesa";
  provider: string;
  accountName: string;
  accountNumber: string | null;
  currency: string;
  status: "connected" | "disconnected";
  isDefault: boolean;
  isTrackingEnabled: boolean;
  lastSynced: string | null;
  totalTransactions: number;
  totalSpending: number;
  totalIncome: number;
  balance: number;
}

export interface GoalDTO {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
}

export interface BillDTO {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  recurrenceInterval: "monthly" | "yearly" | "one_time";
}

export interface NotificationDTO {
  id: string;
  type: "budget_exceeded" | "budget_nearing" | "large_expense" | "monthly_summary" | "upcoming_bill";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummaryDTO {
  income: number;
  expenses: number;
  savings: number;
  totalBalance: number;
  totalBudget: number;
  remainingBudget: number;
  spendingByCategory: { name: string; color: string; total: number }[];
  highestCategory: { name: string; color: string; total: number } | null;
  recentTransactions: TransactionDTO[];
  upcomingBills: BillDTO[];
  budgetCount: number;
}

export interface ReportsResponseDTO {
  range: { from: string; to: string };
  totalIncome: number;
  totalExpense: number;
  net: number;
  spendingByCategory: { name: string; color: string; total: number }[];
  topCategories: { name: string; color: string; total: number }[];
  dailySpending: { date: string; total: number }[];
  monthlyTrend: { label: string; income: number; expense: number; year: number; month: number }[];
  budgetUtilization: { name: string; budget: number; spent: number; percentUsed: number }[];
  yearlySummary: { year: number; totalIncome: number; totalExpense: number; transactionCount: number };
  paymentMethodBreakdown: { accountType: string; label: string; spending: number; income: number; transactionCount: number }[];
  weeklyComparison: { thisWeek: number; lastWeek: number; changePercent: number | null };
  transactionCount: number;
}
