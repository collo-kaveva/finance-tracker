"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeftRight, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { apiFetch, type TransactionDTO } from "@/lib/api-client";
import { useUserCurrency } from "@/hooks/use-user-currency";
import { formatMoney } from "@/lib/utils";

export function GlobalSearch() {
  const router = useRouter();
  const currency = useUserCurrency();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<TransactionDTO[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await apiFetch<{ data: TransactionDTO[] }>(
          `/api/transactions?q=${encodeURIComponent(query)}&pageSize=6`
        );
        setResults(res.data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function goToTransactions() {
    setOpen(false);
    router.push(`/dashboard/transactions?q=${encodeURIComponent(query)}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-strong"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search transactions, categories, notes…</span>
          <span className="sm:hidden">Search…</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => e.key === "Enter" && query.trim() && goToTransactions()}
          />
          {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {!query.trim() && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Start typing to search your transactions
            </p>
          )}
          {query.trim() && !loading && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No matches found</p>
          )}
          {results.map((t) => (
            <button
              key={t.id}
              onClick={goToTransactions}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
            >
              <span className="flex items-center gap-2 truncate">
                <ArrowLeftRight className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </span>
              <span className={`font-mono-num shrink-0 text-xs ${t.type === "income" ? "text-primary" : "text-danger"}`}>
                {t.type === "income" ? "+" : "-"}{formatMoney(t.amount, currency)}
              </span>
            </button>
          ))}
          {results.length > 0 && (
            <button
              onClick={goToTransactions}
              className="w-full border-t border-border px-4 py-2 text-center text-xs font-medium text-primary hover:bg-surface-muted"
            >
              View all results
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
