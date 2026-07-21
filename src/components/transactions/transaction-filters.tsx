"use client";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { TransactionFilters } from "@/hooks/use-transactions";
import type { CategoryDTO } from "@/lib/api-client";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

export function TransactionFiltersBar({
  filters,
  onChange,
  categories,
}: {
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
  categories: CategoryDTO[];
}) {
  const activeAdvanced =
    !!filters.dateFrom || !!filters.dateTo || !!filters.amountMin || !!filters.amountMax || !!filters.paymentMethod;

  function set(partial: Partial<TransactionFilters>) {
    onChange({ ...filters, ...partial, page: 1 });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search title or notes…"
          className="pl-8"
          value={filters.q ?? ""}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <Select value={filters.type || "all"} onValueChange={(v) => set({ type: v === "all" ? "" : (v as "income" | "expense") })}>
        <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.categoryId || "all"} onValueChange={(v) => set({ categoryId: v === "all" ? "" : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sortBy ?? "date"}:${filters.sortDir ?? "desc"}`}
        onValueChange={(v) => {
          const [sortBy, sortDir] = v.split(":") as [TransactionFilters["sortBy"], TransactionFilters["sortDir"]];
          set({ sortBy, sortDir });
        }}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="date:desc">Newest first</SelectItem>
          <SelectItem value="date:asc">Oldest first</SelectItem>
          <SelectItem value="amount:desc">Amount: high to low</SelectItem>
          <SelectItem value="amount:asc">Amount: low to high</SelectItem>
          <SelectItem value="title:asc">Title: A to Z</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant={activeAdvanced ? "default" : "outline"} size="sm">
            <SlidersHorizontal className="size-3.5" /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">From date</Label>
              <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => set({ dateFrom: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To date</Label>
              <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => set({ dateTo: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min amount</Label>
              <Input type="number" placeholder="0" value={filters.amountMin ?? ""} onChange={(e) => set({ amountMin: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max amount</Label>
              <Input type="number" placeholder="Any" value={filters.amountMax ?? ""} onChange={(e) => set({ amountMax: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payment method</Label>
            <Select value={filters.paymentMethod || "all"} onValueChange={(v) => set({ paymentMethod: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeAdvanced && (
            <Button
              variant="ghost" size="sm" className="w-full"
              onClick={() => set({ dateFrom: "", dateTo: "", amountMin: "", amountMax: "", paymentMethod: "" })}
            >
              <X className="size-3.5" /> Clear advanced filters
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
