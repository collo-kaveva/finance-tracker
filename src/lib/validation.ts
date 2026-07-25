import { z } from "zod";

export const currencies = [
  "USD", "EUR", "GBP", "INR", "KES", "JPY", "AUD", "CAD", "ZAR", "NGN",
] as const;

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  currency: z.enum(currencies),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  currency: z.enum(currencies),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const transactionTypeEnum = z.enum(["income", "expense"]);
export const paymentMethodEnum = z.enum([
  "cash", "card", "bank_transfer", "upi", "other",
]);

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: transactionTypeEnum,
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().optional().nullable(),
  paymentMethod: paymentMethodEnum,
  notes: z.string().max(500).optional().nullable(),
  date: z.string().min(1, "Date is required"),
  receiptUrl: z.string().optional().nullable(),
  isRecurring: z.boolean(),
  recurrenceInterval: z.enum(["weekly", "monthly", "yearly"]).optional().nullable(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  color: z.string().min(4).max(9),
  icon: z.string().min(1),
  type: transactionTypeEnum,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const budgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const accountTypeEnum = z.enum(["bank", "paypal", "mpesa"]);

export const accountSchema = z.object({
  type: accountTypeEnum,
  provider: z.string().min(1, "Provider is required").max(60),
  accountName: z.string().min(1, "Account name is required").max(60),
  accountNumber: z.string().max(40).optional().nullable(),
  currency: z.enum(currencies),
  isDefault: z.boolean(),
  isTrackingEnabled: z.boolean(),
});
export type AccountInput = z.infer<typeof accountSchema>;

export const goalSchema = z.object({
  name: z.string().min(1).max(80),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0),
  deadline: z.string().optional().nullable(),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const billSchema = z.object({
  title: z.string().min(1).max(120),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  recurrenceInterval: z.enum(["monthly", "yearly", "one_time"]),
  isPaid: z.boolean(),
});
export type BillInput = z.infer<typeof billSchema>;
