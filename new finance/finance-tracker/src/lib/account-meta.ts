export const ACCOUNT_TYPE_META = {
  bank: {
    label: "Bank Account",
    emoji: "🏦",
    color: "#6a8caf",
    mockProviders: ["Chase", "Bank of America", "Wells Fargo", "Equity Bank", "KCB Bank"],
  },
  paypal: {
    label: "PayPal",
    emoji: "💳",
    color: "#4f7fbf",
    mockProviders: ["PayPal"],
  },
  mpesa: {
    label: "M-Pesa",
    emoji: "📱",
    color: "#2c8a5f",
    mockProviders: ["Safaricom M-Pesa"],
  },
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPE_META;

export function maskAccountNumber(raw: string, type: AccountType) {
  const digits = raw.replace(/\D/g, "");
  if (type === "mpesa") {
    // Phone-style masking: 07•• ••• 234
    const last3 = digits.slice(-3) || digits;
    return `•••• ${last3}`;
  }
  const last4 = digits.slice(-4) || digits.slice(-4);
  return `•••• •••• ${last4 || "0000"}`;
}

export function randomAccountNumber(type: AccountType) {
  if (type === "mpesa") {
    return `07${Math.floor(10000000 + Math.random() * 89999999)}`;
  }
  return String(Math.floor(1000000000 + Math.random() * 8999999999));
}
