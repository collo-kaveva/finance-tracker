"use client";
import * as React from "react";
import { Bell, AlertTriangle, TrendingDown, Receipt, CalendarClock, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";
import type { NotificationDTO } from "@/lib/api-client";

const ICONS: Record<NotificationDTO["type"], React.ElementType> = {
  budget_exceeded: AlertTriangle,
  budget_nearing: TrendingDown,
  large_expense: Receipt,
  monthly_summary: Info,
  upcoming_bill: CalendarClock,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPopover() {
  const { data: notifications, isLoading } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-danger-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          )}
          {!isLoading && (!notifications || notifications.length === 0) && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
            </div>
          )}
          {notifications?.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => !n.isRead && markOne.mutate(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-muted",
                  !n.isRead && "bg-primary-soft/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                    n.type === "budget_exceeded" ? "bg-danger-soft text-danger" :
                    n.type === "budget_nearing" ? "bg-warning-soft text-warning" :
                    "bg-primary-soft text-primary"
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-snug">{n.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{n.message.replace(/\s*\[.*?\]$/, "")}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.isRead && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
