"use client";
import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestResetSchema } from "@/lib/validation";
import { z } from "zod";

type FormValues = z.infer<typeof requestResetSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [devLink, setDevLink] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(requestResetSchema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Something went wrong");
      return;
    }
    setSent(true);
    if (data.devResetLink) setDevLink(data.devResetLink);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" description="If an account exists, a reset link is on its way.">
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <MailCheck className="size-4 text-primary" /> Reset link sent
          </div>
          <p className="mt-2 text-muted-foreground">
            No email server is configured in this demo, so here&apos;s your link directly:
          </p>
          {devLink && (
            <Link href={devLink} className="mt-2 block break-all text-primary hover:underline">
              {devLink}
            </Link>
          )}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
