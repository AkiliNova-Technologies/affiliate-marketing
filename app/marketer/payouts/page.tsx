"use client";

import * as React from "react";
import { useState } from "react";
import {
  IconX,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconCalendar,
  IconCheck,
  IconAlertTriangle,
  IconShoppingCart,
  IconCurrencyDollar,
  IconClick,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { TrendingUpIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MarketerAppSidebar } from "@/components/marketer-app-sidebar";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

type PayoutStatus =
  | "Processed"
  | "Failed"
  | "Requested"
  | "In Process"
  | "Cancelled";

interface PayoutRecord {
  id: string;
  amount: string;
  dateRequested: string;
  status: PayoutStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYOUTS: PayoutRecord[] = [
  {
    id: "PR-00290",
    amount: "$400",
    dateRequested: "11/05/2026",
    status: "Processed",
  },
  {
    id: "PR-00289",
    amount: "$5,400",
    dateRequested: "11/05/2026",
    status: "Failed",
  },
  {
    id: "PR-00288",
    amount: "$6,400",
    dateRequested: "11/05/2026",
    status: "Requested",
  },
  {
    id: "PR-00287",
    amount: "$500",
    dateRequested: "10/05/2026",
    status: "In Process",
  },
  {
    id: "PR-00286",
    amount: "$5,400",
    dateRequested: "10/05/2026",
    status: "Failed",
  },
  {
    id: "PR-00285",
    amount: "$5,460",
    dateRequested: "10/05/2026",
    status: "Cancelled",
  },
  {
    id: "PR-00284",
    amount: "$2,00",
    dateRequested: "10/05/2026",
    status: "Processed",
  },
  {
    id: "PR-00283",
    amount: "$4,00",
    dateRequested: "10/05/2026",
    status: "Requested",
  },
  {
    id: "PR-00282",
    amount: "$55,600",
    dateRequested: "10/05/2026",
    status: "In Process",
  },
  {
    id: "PR-00281",
    amount: "$2,400",
    dateRequested: "10/05/2026",
    status: "Cancelled",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const HAS_PAYOUT_METHOD = true;
const AVAILABLE_BALANCE = 20000;
const PENDING_BALANCE = 1000;
const MIN_PAYOUT = 100;

// ─── Marketer stat cards — 3 cards: Total Clicks, Total Sales, Conversion Rate

interface MarketerStatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  gradient: string;
}

const MARKETER_STAT_CARDS: MarketerStatCard[] = [
  {
    title: "Total Clicks",
    value: "2,000",
    change: "+15%",
    icon: IconClick,
    gradient: "from-[#F97316] to-[#FB923C]",
  },
  {
    title: "Total sales",
    value: "400",
    change: "+5%",
    icon: IconShoppingCart,
    gradient: "from-[#EA580C] to-[#C2410C]",
  },
  {
    title: "Overall Conversion Rate",
    value: "70%",
    change: "+5%",
    icon: IconCurrencyDollar,
    gradient: "from-[#92400E] to-[#78350F]",
  },
];

function MarketerStatCardItem({ card }: { card: MarketerStatCard }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-sm",
        card.gradient,
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 Q50 30 100 55 T200 45"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M0 75 Q60 45 120 65 T200 60"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M0 90 Q70 60 130 80 T200 75"
          fill="none"
          stroke="white"
          strokeWidth="0.75"
        />
      </svg>
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">{card.title}</p>
            <div className="rounded-lg p-2 bg-white/20">
              <card.icon className="size-5 text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4">
              <TrendingUpIcon size={14} /> {card.change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payout status badge ──────────────────────────────────────────────────────

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    Processed: "border border-teal-500 text-teal-600",
    Failed: "border border-orange-500 text-orange-600",
    Requested: "border border-gray-400 text-gray-600",
    "In Process": "border border-blue-300 text-blue-600",
    Cancelled: "border border-red-500 text-red-600",
  };
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

const PAYOUT_COLUMNS: ColumnDef<PayoutRecord, unknown>[] = [
  {
    accessorKey: "id",
    header: "Request ID",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount Requested",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.amount}</span>
    ),
  },
  {
    accessorKey: "dateRequested",
    header: "Date Requested",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.dateRequested}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
  },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Withdrawal Success Modal ─────────────────────────────────────────────────

function WithdrawSuccessModal({
  amount,
  onClose,
}: {
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-8 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        <div className="flex justify-center mb-6">
          <img src="/success.png" alt="" className="h-36 w-36 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Your ${amount.toLocaleString()} withdrawal
          <br />
          has been Initiated
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-8">
          Your request will be processed within 2-3 working days
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-md bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            <span className="flex size-5 items-center justify-center rounded-full border-2 border-[#F97316]">
              <IconCheck className="size-3 text-[#F97316]" strokeWidth={3} />
            </span>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketerPayoutsPage() {
  const [showBanner, setShowBanner] = useState(true);
  const hasPayoutMethod = HAS_PAYOUT_METHOD;

  const [showAvailable, setShowAvailable] = useState(true);
  const [showPending, setShowPending] = useState(true);

  // Step-based withdraw: hidden → input visible → submitting
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [withdrawnAmount, setWithdrawnAmount] = useState<number | null>(null);

  const canWithdraw = hasPayoutMethod && AVAILABLE_BALANCE >= MIN_PAYOUT;
  const parsedAmount = parseFloat(withdrawAmount.replace(/,/g, ""));
  const isFullBalance = parsedAmount === AVAILABLE_BALANCE;
  const isValidAmount =
    !isNaN(parsedAmount) &&
    parsedAmount >= MIN_PAYOUT &&
    parsedAmount <= AVAILABLE_BALANCE;
  const withdrawBtnLabel = isFullBalance ? "Withdraw full balance" : "Withdraw";
  const withdrawBtnDisabled = !isValidAmount || isWithdrawing;

  const handleWithdraw = async () => {
    if (withdrawBtnDisabled) return;
    setIsWithdrawing(true);
    try {
      await api.post("/api/v1/payouts/withdraw", { amount: parsedAmount });
      setWithdrawAmount("");
      setShowWithdrawInput(false);
      setWithdrawnAmount(parsedAmount);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Withdrawal failed. Please try again.",
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <MarketerAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
          {/* Page title — no back arrow for marketer */}
          <h1 className="text-2xl font-bold text-foreground mb-5">Payouts</h1>

          {/* ── 3 marketer-specific stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {MARKETER_STAT_CARDS.map((card) => (
              <MarketerStatCardItem key={card.title} card={card} />
            ))}
          </div>

          {/* Banner */}
          {showBanner && (
            <div
              className={cn(
                "mb-4 flex items-center gap-3 rounded-md border px-5 py-3.5",
                hasPayoutMethod
                  ? "border-green-200 border-l-4 border-l-green-500 bg-green-50"
                  : "border-yellow-200 border-l-4 border-l-yellow-400 bg-yellow-50",
              )}
            >
              {hasPayoutMethod ? (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-green-500">
                  <IconCheck
                    className="size-3 text-green-600"
                    strokeWidth={3}
                  />
                </div>
              ) : (
                <IconAlertTriangle className="size-5 shrink-0 text-yellow-500" />
              )}
              <p className="flex-1 text-sm font-semibold text-foreground">
                {hasPayoutMethod ? (
                  <>
                    Payout method configured. Your Bank Account ends in ***6789.{" "}
                    <a
                      href="/settings"
                      className="underline underline-offset-2 hover:text-[#F97316] transition-colors"
                    >
                      Confirm
                    </a>
                  </>
                ) : (
                  <>
                    Your Payout method is not set up. Go to{" "}
                    <a
                      href="/settings"
                      className="underline underline-offset-2 hover:text-[#F97316] transition-colors font-bold"
                    >
                      Settings
                    </a>{" "}
                    to configure.
                  </>
                )}
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IconX className="size-4" />
              </button>
            </div>
          )}

          {/* ── Balance card ── */}
          <div className="rounded-md border bg-[#F5F2EF] mb-5 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Available Balance — inline withdraw */}
              <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Available Balance
                  </span>
                  <button
                    onClick={() => setShowAvailable((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAvailable ? (
                      <IconEye className="size-5" />
                    ) : (
                      <IconEyeOff className="size-5" />
                    )}
                  </button>
                </div>
                <p className="text-3xl font-bold text-foreground mb-5">
                  {showAvailable
                    ? `$ ${AVAILABLE_BALANCE.toLocaleString()}`
                    : "$ ••••••"}
                </p>

                {!canWithdraw ? (
                  /* Balance below minimum */
                  <button
                    disabled
                    className="w-full rounded-lg bg-gray-200 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
                  >
                    Minimum payout is ${MIN_PAYOUT}
                  </button>
                ) : !showWithdrawInput ? (
                  /* Step 1: initial state — just "Withdraw now" */
                  <button
                    onClick={() => setShowWithdrawInput(true)}
                    className="w-full rounded-lg bg-[#1a1a1a] py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
                  >
                    Withdraw now
                  </button>
                ) : (
                  /* Step 2: input visible */
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Withdraw amount{" "}
                        <span className="text-[#F97316]">*</span>
                      </label>
                      <Input
                        type="text"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        autoFocus
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowWithdrawInput(false);
                          setWithdrawAmount("");
                        }}
                        className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      {/* Dynamic label: "Withdraw" or "Withdraw full balance" */}
                      <button
                        onClick={handleWithdraw}
                        disabled={withdrawBtnDisabled}
                        className={cn(
                          "flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-colors",
                          !withdrawBtnDisabled
                            ? "bg-[#1a1a1a] hover:bg-[#333]"
                            : "bg-gray-300 cursor-not-allowed",
                        )}
                      >
                        {isWithdrawing ? (
                          <span className="flex items-center justify-center gap-2">
                            <Spinner /> Processing…
                          </span>
                        ) : (
                          withdrawBtnLabel
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Release Balance */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pending Release Balance
                  </span>
                  <button
                    onClick={() => setShowPending((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPending ? (
                      <IconEye className="size-5" />
                    ) : (
                      <IconEyeOff className="size-5" />
                    )}
                  </button>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {showPending
                    ? `$ ${PENDING_BALANCE.toLocaleString()}`
                    : "$ ••••••"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Payout History table ── */}
          <DataTable
            columns={PAYOUT_COLUMNS}
            data={MOCK_PAYOUTS}
            title="Payout History"
            description="Manage your payout history."
            searchColumn="id"
            searchPlaceholder="Search history"
            showFilters={false}
            showSort
            showSelection
            showPagination
            pageSize={10}
            headerAction={
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">
                  <IconCalendar className="size-4 text-gray-400" />
                  Transaction Status
                  <IconChevronDown className="size-3.5 text-gray-400" />
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">
                  <IconCalendar className="size-4 text-gray-400" />
                  1/05/2026 - 11/05/2026
                </button>
              </div>
            }
            emptyState={
              <div className="flex flex-col items-center justify-center py-16 text-center w-full">
                <div className="flex items-center justify-center p-6 h-48 w-48 border rounded-full bg-[#EFEFEF]">
                  <img
                    src="/emptystate.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  No payout history found
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Your payout Information will appear here after initiating a
                  withdraw
                </p>
                <button className="rounded-md bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors">
                  Add products
                </button>
              </div>
            }
          />
        </div>
      </SidebarInset>

      {/* Withdrawal success modal */}
      {withdrawnAmount !== null && (
        <WithdrawSuccessModal
          amount={withdrawnAmount}
          onClose={() => setWithdrawnAmount(null)}
        />
      )}
    </SidebarProvider>
  );
}
