"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, RefreshCw, Star, Trash2, Pencil, Loader2, Landmark, Wifi, WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as Icons from "lucide-react";
import { accountSchema, currencies, type AccountInput } from "@/lib/validation";
import { ACCOUNT_TYPE_META, type AccountType } from "@/lib/account-meta";
import {
  useAccounts, useConnectAccount, useUpdateAccount, useSetDefaultAccount,
  useToggleAccountTracking, useSyncAccount, useToggleAccountConnection, useDeleteAccount,
} from "@/hooks/use-accounts";
import { formatMoney } from "@/lib/utils";
import type { AccountDTO } from "@/lib/api-client";

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AccountFormDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: AccountDTO | null;
}) {
  const connect = useConnectAccount();
  const update = useUpdateAccount();

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema) as Resolver<AccountInput>,
    defaultValues: {
      type: "bank", provider: "", accountName: "", accountNumber: "",
      currency: "USD", isDefault: false, isTrackingEnabled: true,
    },
  });

  const type = watch("type");

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        type: editing.type, provider: editing.provider, accountName: editing.accountName,
        accountNumber: editing.accountNumber ?? "", currency: editing.currency as AccountInput["currency"],
        isDefault: editing.isDefault, isTrackingEnabled: editing.isTrackingEnabled,
      });
    } else {
      reset({ type: "bank", provider: "", accountName: "", accountNumber: "", currency: "USD", isDefault: false, isTrackingEnabled: true });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: AccountInput) {
    if (editing) {
      await update.mutateAsync({ id: editing.id, input: values });
    } else {
      await connect.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const saving = connect.isPending || update.isPending;
  const meta = ACCOUNT_TYPE_META[type as AccountType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit account" : "Connect an account"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update how this account is labeled and tracked."
              : "This links a Bank, PayPal, or M-Pesa account. Since real banking APIs are out of scope here, this simulates a provider connection with realistic demo data."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Account type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!!editing}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_META).map(([value, m]) => (
                      <SelectItem key={value} value={value}>{m.emoji} {m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Controller
              control={control}
              name="provider"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {meta.mockProviders.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.provider && <p className="text-xs text-danger">{errors.provider.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountName">Account name</Label>
            <Input id="accountName" placeholder="e.g. Everyday Checking" {...register("accountName")} />
            {errors.accountName && <p className="text-xs text-danger">{errors.accountName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">{type === "mpesa" ? "Phone number" : type === "paypal" ? "Email" : "Account number"}</Label>
              <Input id="accountNumber" placeholder="Optional — we'll simulate one" {...register("accountNumber")} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Set as default</p>
              <p className="text-xs text-muted-foreground">Used as the default account for new transactions</p>
            </div>
            <Controller control={control} name="isDefault" render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Enable tracking</p>
              <p className="text-xs text-muted-foreground">Include this account's spending in insights and reports</p>
            </div>
            <Controller control={control} name="isTrackingEnabled" render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Connect account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccountCard({ account, onEdit }: { account: AccountDTO; onEdit: () => void }) {
  const setDefault = useSetDefaultAccount();
  const toggleTracking = useToggleAccountTracking();
  const sync = useSyncAccount();
  const toggleConnection = useToggleAccountConnection();
  const deleteAccount = useDeleteAccount();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const meta = ACCOUNT_TYPE_META[account.type];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${meta.color}22` }}>
            {meta.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{account.accountName}</p>
              {account.isDefault && <Badge>Default</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{meta.label} · {account.provider} · {account.accountNumber}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Account actions">
              <Icons.MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Pencil /> Edit details</DropdownMenuItem>
            {!account.isDefault && (
              <DropdownMenuItem onClick={() => setDefault.mutate(account.id)}><Star /> Set as default</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => sync.mutate(account.id)}><RefreshCw /> Sync now</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toggleConnection.mutate({ id: account.id, connect: account.status === "disconnected" })}
            >
              {account.status === "connected" ? <><WifiOff /> Disconnect</> : <><Wifi /> Reconnect</>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-danger focus:text-danger">
              <Trash2 /> Remove account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant={account.status === "connected" ? "default" : "secondary"}>
          {account.status === "connected" ? "Connected" : "Disconnected"}
        </Badge>
        <span className="text-xs text-muted-foreground">Last synced {timeAgo(account.lastSynced)}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
        <div>
          <p className="font-mono-num text-sm font-semibold">{account.totalTransactions}</p>
          <p className="text-[11px] text-muted-foreground">Transactions</p>
        </div>
        <div>
          <p className="font-mono-num text-sm font-semibold text-danger">{formatMoney(account.totalSpending, account.currency)}</p>
          <p className="text-[11px] text-muted-foreground">Spending</p>
        </div>
        <div>
          <p className="font-mono-num text-sm font-semibold text-primary">{formatMoney(account.totalIncome, account.currency)}</p>
          <p className="text-[11px] text-muted-foreground">Income</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Track this account's spending</span>
        <Switch
          checked={account.isTrackingEnabled}
          onCheckedChange={(v) => toggleTracking.mutate({ id: account.id, isTrackingEnabled: v })}
        />
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {account.accountName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This disconnects the account. Existing transactions stay in your history but will
              no longer be linked to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteAccount.mutate(account.id); setConfirmDelete(false); }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function ConnectedAccountsSection() {
  const { data: accounts, isLoading } = useAccounts();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AccountDTO | null>(null);

  function openConnect() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(a: AccountDTO) {
    setEditing(a);
    setFormOpen(true);
  }

  return (
    <Card id="connected-accounts">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            <Landmark className="size-4" /> Connected accounts
          </CardTitle>
          <CardDescription>Bank, PayPal, and M-Pesa accounts linked to your transactions</CardDescription>
        </div>
        <Button size="sm" onClick={openConnect}><Plus className="size-3.5" /> Connect account</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Landmark className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No accounts connected yet</p>
              <p className="text-sm text-muted-foreground">Connect a bank, PayPal, or M-Pesa account to start tracking spending by source.</p>
            </div>
            <Button onClick={openConnect}><Plus className="size-4" /> Connect your first account</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((a) => <AccountCard key={a.id} account={a} onEdit={() => openEdit(a)} />)}
          </div>
        )}
      </CardContent>
      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </Card>
  );
}
