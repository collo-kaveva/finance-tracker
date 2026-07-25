import { requireUserId } from "@/lib/session";
import { getAllTransactionsWithCategory } from "@/lib/reports";

function escapeCsv(value: string | number) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: Request) {
  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const all = await getAllTransactionsWithCategory(auth.userId);
  const filtered = all.filter((t) => (!dateFrom || t.date >= dateFrom) && (!dateTo || t.date <= dateTo));
  filtered.sort((a, b) => (a.date < b.date ? -1 : 1));

  const header = ["Date", "Title", "Category", "Type", "Payment Method", "Connected Account", "Amount"];
  const ACCOUNT_LABELS: Record<string, string> = { bank: "Bank", paypal: "PayPal", mpesa: "M-Pesa" };
  const rows = filtered.map((t) => [
    t.date,
    t.title,
    t.categoryName ?? "",
    t.type,
    t.paymentMethod,
    t.accountType ? ACCOUNT_LABELS[t.accountType] ?? t.accountType : "",
    t.amount.toFixed(2),
  ]);

  const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${dateFrom ?? "all"}-to-${dateTo ?? "now"}.csv"`,
    },
  });
}
