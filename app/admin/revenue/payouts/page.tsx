"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  IconArrowLeft,
  IconX,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconMail,
  IconUser,
  IconChevronDown,
  IconBan,
  IconCircleCheck,
  IconAlertCircle,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { DataTable, ViewAction } from "@/components/data-table";

// ─── Types ────────────────────────────────────────────────────────────────────

type PayoutStatus =
  | "Failed"
  | "Requested"
  | "Processed"
  | "In Process"
  | "Cancelled";

type UserType = "Affiliate Marketer" | "Vendor";

interface PayoutRequest {
  id: string;
  invoiceId: string;
  userName: string;
  userType: UserType;
  userAvatar?: string;
  userUsername?: string;
  userStatus?: string;
  userPhone?: string;
  userEmail?: string;
  userJoined?: string;
  amount: number;
  currency?: string;
  payoutMethod: string;
  dateRequested: string;
  status: PayoutStatus;
  // bank details
  bankName?: string;
  accountHolder?: string;
  swiftCode?: string;
  bankAccountNumber?: string;
  // audit
  processedBy?: string;
  processedAt?: string;
  // cancellation
  cancellationReason?: string;
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 64)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 animate-spin", className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, change, icon, gradient,
}: {
  title: string; value: string | number; change?: string;
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-5 text-white", gradient)}>
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M0 60 Q50 30 100 55 T200 45" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M0 75 Q60 45 120 65 T200 60" fill="none" stroke="white" strokeWidth="1" />
        <path d="M0 90 Q70 60 130 80 T200 75" fill="none" stroke="white" strokeWidth="0.75" />
      </svg>
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="shrink-0 rounded-lg bg-white/20 p-2">{icon}</div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4">
              <TrendingUpIcon size={14} /> {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    Processed: "border border-green-400 text-green-600 bg-transparent",
    Requested: "border border-gray-800 text-gray-800 bg-transparent font-semibold",
    Failed: "text-orange-500 bg-transparent border-0 font-medium",
    "In Process": "border border-gray-300 text-gray-500 bg-transparent",
    Cancelled: "text-red-500 bg-transparent border-0 font-medium",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
      styles[status]
    )}>
      {status}
    </span>
  );
}

// ─── Telescope empty state ────────────────────────────────────────────────────

function TelescopeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="size-56 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src="/emptystate.png"
          alt="Nothing here yet"
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-2">Nothing here yet!</h3>
      <p className="text-sm text-muted-foreground text-center">
        Once users start requesting payouts, they will appear here.
      </p>
    </div>
  );
}

// ─── Cancel modal ─────────────────────────────────────────────────────────────

function CancelModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[620px] rounded-2xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">Cancel Payout Request</h2>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </div>
        <div className="border-t border-gray-200 mt-4 mb-5" />

        {/* Body */}
        <label className="block text-sm font-semibold text-foreground">
          Reason for Cancellation
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Provide a brief reason to why you're cancelling this payment request
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={9}
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
        />

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => ok && !isLoading && onConfirm(reason)}
            disabled={!ok || isLoading}
            className={cn(
              "flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white transition-all",
              ok && !isLoading
                ? "bg-red-400 hover:bg-red-500"
                : "bg-red-200 cursor-not-allowed pointer-events-none"
            )}
          >
            {isLoading ? <><Spinner /> Cancelling…</> : <>Cancel Request <IconBan className="size-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Processed modal ──────────────────────────────────────────────────

function PaymentProcessedModal({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-[#fef8f0] p-10 shadow-2xl flex flex-col items-center text-center relative">
        {/* Rocket + coins illustration */}
        <div className="h-44 w-44 flex items-center justify-center mb-4">
          <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
            {/* Coins stack */}
            <ellipse cx="80" cy="130" rx="28" ry="8" fill="#d4a017" />
            <rect x="52" y="112" width="56" height="18" rx="4" fill="#f0c040" />
            <ellipse cx="80" cy="112" rx="28" ry="8" fill="#ffd54f" />
            <rect x="55" y="97" width="50" height="15" rx="4" fill="#f0c040" />
            <ellipse cx="80" cy="97" rx="25" ry="7" fill="#ffd54f" />
            <rect x="58" y="84" width="44" height="13" rx="4" fill="#f0c040" />
            <ellipse cx="80" cy="84" rx="22" ry="6" fill="#ffd54f" />
            {/* Rocket body */}
            <ellipse cx="80" cy="52" rx="14" ry="22" fill="#1a1a1a" />
            <path d="M66 62 L58 80 L80 72 L102 80 L94 62 Z" fill="#374151" />
            {/* Rocket nose */}
            <ellipse cx="80" cy="30" rx="14" ry="8" fill="#1a1a1a" />
            <path d="M66 30 Q80 10 94 30" fill="#1a1a1a" />
            {/* Window */}
            <circle cx="80" cy="50" r="6" fill="#60a5fa" />
            <circle cx="80" cy="50" r="4" fill="#93c5fd" />
            {/* Flames */}
            <path d="M72 84 Q70 96 80 92 Q90 96 88 84" fill="#f97316" opacity="0.9" />
            <path d="M75 84 Q74 90 80 88 Q86 90 85 84" fill="#fbbf24" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-foreground">Payment Processed</h2>
        <p className="mt-2 text-sm text-muted-foreground">This payment has been processed</p>

        <button
          onClick={onDone}
          className="mt-8 flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-10 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
        >
          <IconCircleCheck className="size-4 text-[#F97316]" />
          Done
        </button>

        {/* Bottom X close */}
        <button
          onClick={onDone}
          className="mt-4 flex items-center justify-center size-7 rounded-full border-2 border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors"
        >
          <IconX className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Payment detail view ──────────────────────────────────────────────────────

function PaymentDetailView({
  payout,
  onBack,
}: {
  payout: PayoutRequest;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<PayoutStatus>(payout.status);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showProcessedModal, setShowProcessedModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string; subtitle?: string;
  } | null>(
    payout.status === "Cancelled"
      ? { message: "This payment has been canceled", subtitle: "The reason for canceling this payment has been sent to user's email" }
      : payout.status === "Processed"
      ? { message: "This payment has been processed" }
      : null
  );

  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isVendor = payout.userType === "Vendor";

  const handleMarkProcessed = async () => {
    setStatusOpen(false);
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setActionLoading(false);
    setStatus("Processed");
    setShowProcessedModal(true);
    setNotification({ message: "This payment has been processed" });
  };

  const handleMarkFailed = async () => {
    setStatusOpen(false);
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setActionLoading(false);
    setStatus("Failed");
    setNotification({ message: "This payment has been marked as failed" });
  };

  const handleCancel = async (reason: string) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setActionLoading(false);
    setShowCancelModal(false);
    setStatus("Cancelled");
    setNotification({
      message: "This payment has been canceled",
      subtitle: "The reason for canceling this payment has been sent to user's email",
    });
  };

  const maskedAccount = "****************";
  const realAccount = payout.bankAccountNumber ?? "2565 567575670";

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* ← Payment Details */}
        <div className="mb-5 flex items-center gap-2">
          <button onClick={onBack} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Payment Details</h1>
        </div>

        {/* Invoice header card */}
        <div className="rounded-xl border bg-white px-6 py-5 flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Invoice ID : {payout.invoiceId}</h2>
            <p className="text-sm text-[#F97316] mt-0.5">
              View payment request details and perform actions
            </p>
          </div>
          <PayoutStatusBadge status={status} />
        </div>

        {/* Notification banner */}
        {notification && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50 px-5 py-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="mt-0.5 size-5 shrink-0 text-blue-500">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">{notification.message}</p>
              {notification.subtitle && (
                <p className="text-xs text-blue-700 mt-0.5">{notification.subtitle}</p>
              )}
            </div>
            <button onClick={() => setNotification(null)} className="text-blue-400 hover:text-blue-600">
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* User details + Payout method */}
        <div className="rounded-xl border bg-white p-6 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: user profile */}
            <div className="lg:border-r lg:border-gray-100 lg:pr-8">
              {isVendor ? (
                // Vendor: logo + name + joined
                <div className="flex items-start gap-4 mb-5">
                  <div className="size-16 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    {payout.userAvatar ? (
                      <img src={payout.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {payout.userName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{payout.userName}</h3>
                    {payout.userJoined && (
                      <p className="text-sm font-medium text-[#F97316] mt-0.5">
                        Joined {payout.userJoined}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Marketer: circle avatar with initials + name + username
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative size-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100 shrink-0">
                    <span className="text-base font-bold text-gray-600">
                      {payout.userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{payout.userName}</h3>
                    {payout.userUsername && (
                      <p className="text-sm text-muted-foreground">{payout.userUsername}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact fields */}
              <div className="space-y-3">
                {isVendor ? (
                  <>
                    {[
                      { Icon: IconUser, label: "Contact Person", value: payout.userUsername ?? "Victor Wandulu" },
                      { Icon: IconPhone, label: "Phone number", value: payout.userPhone },
                      { Icon: IconMail, label: "Email Address", value: payout.userEmail },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="grid grid-cols-2 items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="size-4 shrink-0 text-gray-400" />
                          {label}
                        </div>
                        <span className="text-sm text-foreground">{value ?? "—"}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { Icon: IconUser, label: "Status", value: null, isStatus: true },
                      { Icon: IconPhone, label: "Phone number", value: payout.userPhone },
                      { Icon: IconMail, label: "Email Address", value: payout.userEmail },
                    ].map(({ Icon, label, value, isStatus }) => (
                      <div key={label} className="grid grid-cols-2 items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="size-4 shrink-0 text-gray-400" />
                          {label}
                        </div>
                        {isStatus ? (
                          <span className="inline-flex items-center rounded-full border border-green-400 text-green-600 px-3 py-0.5 text-xs font-medium w-fit">
                            {payout.userStatus ?? "Active"}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground">{value ?? "—"}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Right: Payout method */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">Payout method</h3>

              {/* Bank info box */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 mb-3">
                <div className="space-y-2">
                  {[
                    { label: "Bank name", value: payout.bankName ?? "EQUITY BANK UGANDA LIMITED" },
                    { label: "Account Holder", value: payout.accountHolder ?? "VICTOR WANDULU" },
                    { label: "Swift code", value: payout.swiftCode ?? "S34wi67fT" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
                      <span className="text-sm text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank account number with show/hide */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Bank Account Number</span>
                <span className="text-sm text-foreground font-mono flex-1 text-right">
                  {showAccountNumber ? realAccount : maskedAccount}
                </span>
                <button
                  onClick={() => setShowAccountNumber((s) => !s)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showAccountNumber ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment information */}
        <div className="rounded-xl border bg-white p-6 mb-4">
          <h3 className="text-base font-semibold text-foreground mb-4">Payment  information</h3>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Requested amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Requested date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-5 py-4 text-foreground font-medium">
                    $ {payout.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-foreground">
                    {payout.dateRequested}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-5">
            <p className="text-sm font-medium text-foreground">Total payment amount</p>
            <p className="text-2xl font-bold text-foreground">$ {payout.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Audit Trail + Change Status */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-start justify-between gap-6">

            {/* Audit Trail */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-4">Audit Trail</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: (
                      <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    ),
                    label: "Processed By",
                    value: payout.processedBy ?? "John Smith (Admin)",
                  },
                  {
                    icon: (
                      <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    ),
                    label: "Processed At",
                    value: payout.processedAt ?? "13 Mar 2026 – 10:04",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="shrink-0">{icon}</span>
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
                    <span className="text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Status dropdown */}
            <div ref={statusRef} className="relative shrink-0">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                disabled={actionLoading}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors shadow-sm disabled:opacity-60 min-w-[180px]"
              >
                {actionLoading ? (
                  <><Spinner /> Updating…</>
                ) : (
                  <><span>Change Status</span><IconChevronDown className="size-4 text-gray-400" /></>
                )}
              </button>

              {statusOpen && !actionLoading && (
                <div className="absolute top-full right-0 mt-1 w-52 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden z-10">
                  <button
                    onClick={handleMarkFailed}
                    className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                  >
                    Mark as failed
                  </button>
                  <button
                    onClick={handleMarkProcessed}
                    className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                  >
                    Mark as processed
                  </button>
                  <button
                    onClick={() => { setStatusOpen(false); setShowCancelModal(true); }}
                    className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                  >
                    Mark as Canceled
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <CancelModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          isLoading={actionLoading}
        />
      )}

      {/* Payment Processed modal */}
      {showProcessedModal && (
        <PaymentProcessedModal onDone={() => setShowProcessedModal(false)} />
      )}
    </PageShell>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYOUTS: PayoutRequest[] = [
  {
    id: "1", invoiceId: "PR-00290", userName: "Victor Wandulu", userType: "Affiliate Marketer",
    userUsername: "VanVictor", userStatus: "Active", userPhone: "076407857",
    userEmail: "vicwand@tekjuice.com", amount: 400, payoutMethod: "Bank transfer",
    dateRequested: "11/05/2026", status: "Failed",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "VICTOR WANDULU",
    swiftCode: "S34wi67fT", bankAccountNumber: "2565 567575670",
    processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "2", invoiceId: "PR-00289", userName: "World of Africa", userType: "Vendor",
    userJoined: "16/02/2026", userPhone: "076407857", userEmail: "vicwand@tekjuice.com",
    userUsername: "Victor Wandulu", amount: 5400, payoutMethod: "Bank transfer",
    dateRequested: "11/05/2026", status: "Requested",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "WORLD OF AFRICA LTD",
    swiftCode: "S34wi67fT", bankAccountNumber: "2565 567575670",
    processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "3", invoiceId: "PR-00288", userName: "Asiimwe Godwin", userType: "Affiliate Marketer",
    userPhone: "076407858", userEmail: "asiimwe@tekjuice.com", amount: 6400,
    payoutMethod: "Bank transfer", dateRequested: "11/05/2026", status: "Processed",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "ASIIMWE GODWIN",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "4", invoiceId: "PR-00287", userName: "Innocent Ademon", userType: "Affiliate Marketer",
    userPhone: "076407859", userEmail: "innocent@tekjuice.com", amount: 500,
    payoutMethod: "Bank transfer", dateRequested: "10/05/2026", status: "In Process",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "INNOCENT ADEMON",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "5", invoiceId: "PR-00286", userName: "Muthoni Angella", userType: "Affiliate Marketer",
    userPhone: "076407860", userEmail: "muthoni@tekjuice.com", amount: 5400,
    payoutMethod: "Bank transfer", dateRequested: "10/05/2026", status: "Failed",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "MUTHONI ANGELLA",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "6", invoiceId: "PR-00285", userName: "Webina Lawson", userType: "Affiliate Marketer",
    userPhone: "076407861", userEmail: "webina@tekjuice.com", amount: 5460,
    payoutMethod: "Bank transfer", dateRequested: "10/05/2026", status: "Cancelled",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "WEBINA LAWSON",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "7", invoiceId: "PR-00284", userName: "Khalid Aucho", userType: "Vendor",
    userJoined: "15/01/2026", userPhone: "076407862", userEmail: "khalid@tekjuice.com",
    userUsername: "Khalid Aucho", amount: 200, payoutMethod: "Bank transfer",
    dateRequested: "10/05/2026", status: "Processed",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "KHALID AUCHO",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "8", invoiceId: "PR-00283", userName: "Quincy Maine", userType: "Vendor",
    userJoined: "10/01/2026", userPhone: "076407863", userEmail: "quincy@tekjuice.com",
    userUsername: "Quincy Maine", amount: 400, payoutMethod: "Bank transfer",
    dateRequested: "10/05/2026", status: "Requested",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "QUINCY MAINE",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "9", invoiceId: "PR-00282", userName: "Yvette Mandela", userType: "Vendor",
    userJoined: "05/01/2026", userPhone: "076407864", userEmail: "yvette@tekjuice.com",
    userUsername: "Yvette Mandela", amount: 55600, payoutMethod: "Bank transfer",
    dateRequested: "10/05/2026", status: "In Process",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "YVETTE MANDELA",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
  {
    id: "10", invoiceId: "PR-00281", userName: "Mulutta Peter", userType: "Affiliate Marketer",
    userPhone: "076407865", userEmail: "mulutta@tekjuice.com", amount: 2400,
    payoutMethod: "Bank transfer", dateRequested: "10/05/2026", status: "Cancelled",
    bankName: "EQUITY BANK UGANDA LIMITED", accountHolder: "MULUTTA PETER",
    swiftCode: "S34wi67fT", processedBy: "John Smith (Admin)", processedAt: "13 Mar 2026 – 10:04",
  },
];

const PAGE_SIZE = 10;

// ─── Payouts list page ────────────────────────────────────────────────────────

function PayoutsListPage({
  payouts,
  onViewPayout,
}: {
  payouts: PayoutRequest[];
  onViewPayout: (p: PayoutRequest) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalRevenue = payouts.reduce((s, p) => s + p.amount, 0);
  const totalRequested = payouts.filter((p) => p.status === "Requested").reduce((s, p) => s + p.amount, 0);
  const totalProcessed = payouts.filter((p) => p.status === "Processed").reduce((s, p) => s + p.amount, 0);

  const DollarIcon = () => (
    <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9h4.5a2.5 2.5 0 010 5H9m0 0h4.5" />
    </svg>
  );

  const stats = [
    {
      title: "Total platform revenue",
      value: `$${(totalRevenue / 1000).toFixed(0)}K`,
      change: "+5%",
      icon: <DollarIcon />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Total Requested Payments",
      value: `$${totalRequested.toLocaleString()}`,
      change: "+5%",
      icon: <DollarIcon />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
    {
      title: "Total Processed payments",
      value: `$${(totalProcessed / 1000).toFixed(0)}K`,
      change: "+5%",
      icon: <DollarIcon />,
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
  ];

  // ── Column definitions ───────────────────────────────────────────────────
  const columns: ColumnDef<PayoutRequest>[] = [
    {
      id: "invoiceId",
      accessorKey: "invoiceId",
      header: "Invoice ID",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.invoiceId}</span>
      ),
    },
    {
      id: "user",
      accessorFn: (p) => p.userName,
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.userName}</p>
          <p className="text-xs text-muted-foreground">{row.original.userType}</p>
        </div>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-foreground">${row.original.amount.toLocaleString()}</span>
      ),
    },
    {
      id: "payoutMethod",
      accessorKey: "payoutMethod",
      header: "Payout Method",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.payoutMethod}</span>
      ),
    },
    {
      id: "dateRequested",
      accessorKey: "dateRequested",
      header: "Date Requested",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.dateRequested}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ViewAction onClick={() => onViewPayout(row.original)} />
      ),
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* Page title */}
        <h1 className="mb-5 text-2xl font-bold text-foreground">Payouts</h1>

        {/* 3 stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={payouts}
          title="Payout Request Queue"
          description="Manage payout requests from vendors and marketers."
          searchColumn="user"
          searchPlaceholder="Search"
          showFilters
          showSort
          sortLabel="Ascending"
          showSelection
          showPagination
          pageSize={PAGE_SIZE}
          total={payouts.length}
          page={currentPage}
          onPageChange={setCurrentPage}
          emptyState={<TelescopeEmptyState />}
        />
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "detail";

export default function PayoutsPage() {
  const [view, setView] = useState<View>("list");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  // Replace MOCK_PAYOUTS with your Redux hook when ready
  const payouts = MOCK_PAYOUTS;

  const handleView = useCallback((payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPayout(null);
    setView("list");
  }, []);

  if (view === "detail" && selectedPayout) {
    return <PaymentDetailView payout={selectedPayout} onBack={handleBack} />;
  }

  return <PayoutsListPage payouts={payouts} onViewPayout={handleView} />;
}