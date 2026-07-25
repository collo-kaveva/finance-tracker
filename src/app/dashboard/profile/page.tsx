"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { profileSchema, changePasswordSchema, currencies } from "@/lib/validation";
import { z } from "zod";
import { ConnectedAccountsSection } from "@/components/profile/connected-accounts";
import { SpendingWarningsPanel } from "@/components/dashboard/spending-warnings";

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

function initials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileValues>,
    values: { name: session?.user?.name ?? "", currency: (session?.user?.currency as ProfileValues["currency"]) ?? "USD" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  async function onSaveProfile(values: ProfileValues) {
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSavingProfile(false);
    if (!res.ok) {
      toast.error(data.error || "Failed to update profile");
      return;
    }
    toast.success("Profile updated");
    await update({ name: values.name, currency: values.currency });
  }

  async function onChangePassword(values: PasswordValues) {
    setSavingPassword(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      toast.error(data.error || "Failed to change password");
      return;
    }
    toast.success("Password updated");
    passwordForm.reset({ currentPassword: "", newPassword: "" });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">Personal information</CardTitle>
          <CardDescription>This is how you appear across Ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">{initials(session?.user?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-danger">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Preferred currency</Label>
              <Select
                value={profileForm.watch("currency")}
                onValueChange={(v) => profileForm.setValue("currency", v as ProfileValues["currency"])}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground">Change password</CardTitle>
          <CardDescription>Use a strong password you don&apos;t use elsewhere</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-danger">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-danger">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword && <Loader2 className="size-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConnectedAccountsSection />
      <SpendingWarningsPanel limit={8} />
    </div>
  );
}
