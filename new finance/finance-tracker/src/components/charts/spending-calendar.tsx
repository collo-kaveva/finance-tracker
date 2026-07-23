"use client";
import { formatMoney } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function SpendingCalendar({
  year, month, dailySpending, currency,
}: {
  year: number;
  month: number;
  dailySpending: { date: string; total: number }[];
  currency: string;
}) {
  const byDate = new Map(dailySpending.map((d) => [d.date, d.total]));
  const max = Math.max(1, ...dailySpending.map((d) => d.total));
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`),
  ];

  function intensity(amount: number) {
    if (amount === 0) return "bg-surface-muted";
    const ratio = amount / max;
    if (ratio > 0.75) return "bg-primary";
    if (ratio > 0.5) return "bg-primary/70";
    if (ratio > 0.25) return "bg-primary/45";
    return "bg-primary/20";
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground">
        {WEEKDAYS.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const amount = byDate.get(date) ?? 0;
          const day = Number(date.slice(-2));
          return (
            <Popover key={date}>
              <PopoverTrigger asChild>
                <button
                  className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-medium transition-colors ${intensity(amount)} ${amount > max * 0.5 ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {day}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 text-xs">
                <p className="font-medium">{new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                <p className="font-mono-num text-muted-foreground">{formatMoney(amount, currency)} spent</p>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
