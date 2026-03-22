"use client";

import * as React from "react";
import { useState } from "react";
import {
  IconBell,
  IconCheck,
  IconChecks,
  IconPackage,
  IconCurrencyDollar,
  IconBroadcast,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "sale" | "payout" | "campaign" | "system" | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ─── Mock notifications ───────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "sale",
    title: "New Sale",
    message: "You earned $6,000 from a sale of Kampala Nites App via your referral link.",
    timestamp: "2 mins ago",
    read: false,
  },
  {
    id: "2",
    type: "payout",
    title: "Payout Processed",
    message: "Your withdrawal of $20,000 has been processed and sent to your bank account.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "campaign",
    title: "Campaign Activated",
    message: "Your campaign for \"Chimpman Deliveries\" is now live and accepting traffic.",
    timestamp: "3 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    title: "Payout Method Missing",
    message: "You have not set up a payout method yet. Go to Settings to configure one.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Platform Update",
    message: "TekAffiliate has been updated with new marketplace features. Check out what's new.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "6",
    type: "sale",
    title: "New Sale",
    message: "You earned $300 from a sale of Learn Spanish with Señor Esperazzo.",
    timestamp: "2 days ago",
    read: true,
  },
];

// ─── Notification icon by type ────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotificationType }) {
  const config: Record<NotificationType, { icon: React.ElementType; bg: string; color: string }> = {
    sale:     { icon: IconCurrencyDollar, bg: "bg-green-100",   color: "text-green-600" },
    payout:   { icon: IconPackage,        bg: "bg-blue-100",    color: "text-blue-600"  },
    campaign: { icon: IconBroadcast,      bg: "bg-orange-100",  color: "text-[#F97316]" },
    alert:    { icon: IconAlertCircle,    bg: "bg-yellow-100",  color: "text-yellow-600"},
    system:   { icon: IconBell,           bg: "bg-gray-100",    color: "text-gray-500"  },
  };
  const { icon: Icon, bg, color } = config[type];
  return (
    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", bg)}>
      <Icon className={cn("size-4", color)} />
    </div>
  );
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotifRow({
  notif,
  onMarkRead,
  onDismiss,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl px-4 py-3.5 transition-colors",
        notif.read ? "bg-transparent hover:bg-gray-50" : "bg-[#FFF7F0] hover:bg-orange-50/80"
      )}
    >
      {/* Unread dot */}
      {/* {!notif.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#F97316]" />
      )} */}

      <NotifIcon type={notif.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-snug", notif.read ? "font-medium text-foreground" : "font-semibold text-foreground")}>
            {notif.title}
          </p>
          {/* Dismiss button — visible on hover */}
          <button
            onClick={() => onDismiss(notif.id)}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
          >
            <IconX className="size-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
          {notif.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
          {!notif.read && (
            <button
              onClick={() => onMarkRead(notif.id)}
              className="flex items-center gap-1 text-[10px] text-[#F97316] hover:underline font-medium"
            >
              <IconCheck className="size-3" /> Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Sheet ──────────────────────────────────────────────────────

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = activeTab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] p-0 flex flex-col"
      >
        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-bold">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center rounded-full bg-[#F97316] px-2 py-0.5 text-[10px] font-bold text-white min-w-[20px]">
                  {unreadCount}
                </span>
              )}
            </div>
            {/* {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-[#F97316] hover:underline font-medium"
              >
                <IconChecks className="size-3.5" /> Mark all read
              </button>
            )} */}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-gray-100">
            {(["all", "unread"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative pb-3 px-1 text-sm font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "unread" ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` : "All"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[#F97316]" />
                )}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* ── Notification list ── */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <IconBell className="size-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {activeTab === "unread" ? "All caught up!" : "No notifications yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeTab === "unread"
                  ? "You have no unread notifications."
                  : "When you get notifications, they'll appear here."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-1">
              {displayed.map((notif) => (
                <NotifRow
                  key={notif.id}
                  notif={notif}
                  onMarkRead={handleMarkRead}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Bell button with unread badge ───────────────────────────────────────────
// Re-exported so SiteHeader can use it as a drop-in replacement

interface NotificationsBellProps {
  className?: string;
}

export function NotificationsBell({ className }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);

  // Count unread — in a real app this would come from Redux / API
  const unreadCount = INITIAL_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
          className
        )}
      >
        <IconBell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-2 items-center justify-center rounded-full bg-[#F97316]" />
        )}
      </button>

      <NotificationsSheet open={open} onOpenChange={setOpen} />
    </>
  );
}