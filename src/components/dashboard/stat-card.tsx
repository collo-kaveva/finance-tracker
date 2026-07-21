import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "danger" | "accent";
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-mono-num mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            tone === "primary" && "bg-primary-soft text-primary",
            tone === "danger" && "bg-danger-soft text-danger",
            tone === "accent" && "bg-accent-soft text-accent",
            tone === "default" && "bg-surface-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
    </Card>
  );
}
