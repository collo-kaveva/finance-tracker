"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatCompactMoney, formatMoney } from "@/lib/utils";

interface Point {
  label: string;
  income: number;
  expense: number;
}

export function IncomeExpenseChart({ data, currency }: { data: Point[]; currency: string }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactMoney(v, currency)}
          />
          <Tooltip
            formatter={(value, name) => [formatMoney(Number(value), currency), name === "income" ? "Income" : "Expense"]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(v) => (v === "income" ? "Income" : "Expense")}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="income" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
