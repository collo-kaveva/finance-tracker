import Link from "next/link";
import { BookOpenText } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2 text-foreground">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpenText className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold">Ledger</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14 text-primary-foreground">
          <div />
          <div>
            <p className="font-display text-3xl font-medium leading-snug">
              &ldquo;Every shilling, dollar, or euro has a job. Ledger just keeps them
              honest.&rdquo;
            </p>
            <p className="mt-4 text-sm opacity-80">
              A single place to log income, track budgets, and see where your money
              actually goes — month after month.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs uppercase tracking-wider opacity-70">
            <span>Budgets</span>
            <span>Transactions</span>
            <span>Reports</span>
            <span>Goals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
