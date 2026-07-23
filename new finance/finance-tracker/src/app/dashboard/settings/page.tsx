"use client";
import * as React from "react";
import * as Icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useBills, useCreateBill, useUpdateBill, useDeleteBill } from "@/hooks/use-app-data";
import { useUserCurrency } from "@/hooks/use-user-currency";
import { formatMoney } from "@/lib/utils";
import type { BillDTO } from "@/lib/api-client";

function GoalsSection() {
  const currency = useUserCurrency();
  const { data: goals } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [target, setTarget] = React.useState("");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-foreground">Savings goals</CardTitle>
          <CardDescription>Track progress toward something you&apos;re saving for</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Icons.Plus className="size-3.5" /> New goal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>New savings goal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Goal name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency fund" />
              </div>
              <div className="space-y-1.5">
                <Label>Target amount</Label>
                <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="5000" />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!name.trim() || !target}
                onClick={async () => {
                  await createGoal.mutateAsync({ name, targetAmount: Number(target), currentAmount: 0, deadline: null });
                  setName(""); setTarget(""); setOpen(false);
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goals && goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
              return (
                <div key={g.id} className="rounded-md border border-border p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium">{g.name}</span>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteGoal.mutate(g.id)}>
                      <Icons.Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <Progress value={pct} />
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatMoney(g.currentAmount, currency)} of {formatMoney(g.targetAmount, currency)}</span>
                    <button
                      className="font-medium text-primary hover:underline"
                      onClick={() => updateGoal.mutate({ id: g.id, input: { currentAmount: g.currentAmount + 50 } })}
                    >
                      + Add {formatMoney(50, currency)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No savings goals yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function BillsSection() {
  const currency = useUserCurrency();
  const { data: bills } = useBills();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const deleteBill = useDeleteBill();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [interval, setInterval] = React.useState<BillDTO["recurrenceInterval"]>("monthly");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-foreground">Bill reminders</CardTitle>
          <CardDescription>Recurring and upcoming bills to keep an eye on</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Icons.Plus className="size-3.5" /> Add bill</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>New bill</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Internet" />
              </div>
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="60" />
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Repeats</Label>
                <Select value={interval} onValueChange={(v) => setInterval(v as BillDTO["recurrenceInterval"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one_time">One time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!title.trim() || !amount || !dueDate}
                onClick={async () => {
                  await createBill.mutateAsync({ title, amount: Number(amount), dueDate, recurrenceInterval: interval, isPaid: false });
                  setTitle(""); setAmount(""); setDueDate(""); setOpen(false);
                }}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {bills && bills.length > 0 ? (
          <ul className="space-y-2">
            {bills.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Icons.CalendarClock className="size-4 text-muted-foreground" />
                  <span className={b.isPaid ? "text-muted-foreground line-through" : ""}>{b.title}</span>
                  <span className="font-mono-num text-xs text-muted-foreground">{formatMoney(b.amount, currency)}</span>
                  <Badge variant="secondary">{new Date(b.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Badge>
                </span>
                <div className="flex items-center gap-2">
                  <Switch checked={b.isPaid} onCheckedChange={(v) => updateBill.mutate({ id: b.id, input: { isPaid: v } })} />
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => deleteBill.mutate(b.id)}>
                    <Icons.Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No bills tracked yet</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Appearance, accounts, goals, and reminders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">Appearance</CardTitle>
          <CardDescription>Choose how Ledger looks on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Icons.Moon className="size-4" /> : <Icons.Sun className="size-4" />}
              <span className="text-sm font-medium">Dark mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Icons.Landmark className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium">Connected accounts</p>
              <p className="text-xs text-muted-foreground">Bank, PayPal, and M-Pesa accounts now live on your Profile page</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/dashboard/profile#connected-accounts">Manage</a>
          </Button>
        </CardContent>
      </Card>
      <GoalsSection />
      <BillsSection />
    </div>
  );
}
