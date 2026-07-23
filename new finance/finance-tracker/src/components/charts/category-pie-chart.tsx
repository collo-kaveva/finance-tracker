"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/utils";
import { PieChart as PieIcon } from "lucide-react";

interface Slice {
  name: string;
  color: string;
  total: number;
}

export function CategoryPieChart({ data, currency }: { data: Slice[]; currency: string }) {
  if (!data.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <PieIcon className="size-8" />
        <p className="text-sm">No expenses yet this period</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {data.slice(0, 7).map((d) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 truncate">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-foreground">{d.name}</span>
            </span>
            <span className="font-mono-num shrink-0 text-muted-foreground">{formatMoney(d.total, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
