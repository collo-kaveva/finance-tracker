"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MONTH_NAMES } from "@/lib/utils";

export function MonthPicker({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    onChange(m, y);
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">
      <Button variant="ghost" size="icon" className="size-7" onClick={() => shift(-1)} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[9rem] text-center text-sm font-medium">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <Button variant="ghost" size="icon" className="size-7" onClick={() => shift(1)} aria-label="Next month">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
