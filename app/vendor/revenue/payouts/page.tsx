"use client";

import * as React from "react";
import { useState } from "react";
import {
  IconArrowLeft,
  IconX,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconCalendar,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type PayoutStatus = "Processed" | "Failed" | "Requested" | "In Process" | "Cancelled";

interface PayoutRecord {
  id: string;
  amount: string;
  dateRequested: string;
  status: PayoutStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: "PR-00290", amount: "$400",    dateRequested: "11/05/2026", status: "Processed"  },
  { id: "PR-00289", amount: "$5,400",  dateRequested: "11/05/2026", status: "Failed"     },
  { id: "PR-00288", amount: "$6,400",  dateRequested: "11/05/2026", status: "Requested"  },
  { id: "PR-00287", amount: "$500",    dateRequested: "10/05/2026", status: "In Process" },
  { id: "PR-00286", amount: "$5,400",  dateRequested: "10/05/2026", status: "Failed"     },
  { id: "PR-00285", amount: "$5,460",  dateRequested: "10/05/2026", status: "Cancelled"  },
  { id: "PR-00284", amount: "$2,00",   dateRequested: "10/05/2026", status: "Processed"  },
  { id: "PR-00283", amount: "$4,00",   dateRequested: "10/05/2026", status: "Requested"  },
  { id: "PR-00282", amount: "$55,600", dateRequested: "10/05/2026", status: "In Process" },
  { id: "PR-00281", amount: "$2,400",  dateRequested: "10/05/2026", status: "Cancelled"  },
];


// ─── Scenario toggle (for dev preview) ───────────────────────────────────────
// Set HAS_PAYOUT_METHOD = false to see the empty / not-configured state
const HAS_PAYOUT_METHOD = true;
const AVAILABLE_BALANCE = 20000;
const PENDING_BALANCE = 1000;
const MIN_PAYOUT = 100;

// ─── Payout status badge ──────────────────────────────────────────────────────

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    Processed:    "border border-teal-500 text-teal-600",
    Failed:       "border border-orange-500 text-orange-600",
    Requested:    "border border-gray-400 text-gray-600",
    "In Process": "border border-blue-300 text-blue-600",
    Cancelled:    "border border-red-500 text-red-600",
  };
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", styles[status])}>
      {status}
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

const PAYOUT_COLUMNS: ColumnDef<PayoutRecord, unknown>[] = [
  {
    accessorKey: "id",
    header: "Invoice ID",
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
      <span className="text-muted-foreground">{row.original.dateRequested}</span>
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
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Withdraw Amount Modal ────────────────────────────────────────────────────

function WithdrawModal({
  availableBalance,
  onClose,
  onSuccess,
}: {
  availableBalance: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount.replace(/,/g, ""));
  const isValid = !isNaN(parsedAmount) && parsedAmount >= MIN_PAYOUT && parsedAmount <= availableBalance;

  const handleWithdrawFull = () => {
    setAmount(availableBalance.toLocaleString());
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/payouts/withdraw", { amount: parsedAmount });
      onSuccess(parsedAmount);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Withdrawal failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-8 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          Enter your withdraw amount
        </h2>

        {/* Amount field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Withdraw amount <span className="text-[#F97316]">*</span>
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter an amount above $100"
            className="w-full rounded-lg border border-[#F97316]/60 bg-white px-4 py-3 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          />
        </div>

        {/* Withdraw full balance */}
        <button
          onClick={handleWithdrawFull}
          className="w-full rounded-lg bg-gray-200/70 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors mb-6"
        >
          Withdraw full balance
        </button>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-white py-3 text-sm font-semibold text-foreground hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className={cn(
              "flex-1 rounded-md py-3 text-sm font-semibold text-white transition-colors",
              isValid && !isSubmitting
                ? "bg-[#1a1a1a] hover:bg-[#333]"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {isSubmitting ? <span className="flex items-center justify-center gap-2"><Spinner />Processing…</span> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-8 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* High-five illustration */}
        <div className="flex justify-center mb-6">
          <img src="./success.png" alt="" className="h-38 w-38"/>
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          Your ${amount.toLocaleString()} withdrawal<br />has been Initiated
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-8">
          Your request will be processed within 2-3 working days
        </p>

        <button
          onClick={onClose}
          className="mx-auto flex items-center gap-2 rounded-md bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
        >
          <span className="flex size-5 items-center justify-center rounded-full border-2 border-[#F97316]">
            <IconCheck className="size-3 text-[#F97316]" strokeWidth={3} />
          </span>
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorPayoutsPage() {
  const [showBanner, setShowBanner] = useState(true);
  const hasPayoutMethod = HAS_PAYOUT_METHOD;

  const [showAvailable, setShowAvailable] = useState(true);
  const [showPending, setShowPending] = useState(true);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<number | null>(null);

  const canWithdraw = hasPayoutMethod && AVAILABLE_BALANCE >= MIN_PAYOUT;

  const handleWithdrawSuccess = (amount: number) => {
    setShowWithdrawModal(false);
    setWithdrawnAmount(amount);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <VendorAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

          {/* Page title */}
          <div className="flex items-center gap-3 mb-4">
            {/* <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center size-8 rounded-full hover:bg-gray-200 transition-colors"
            >
              <IconArrowLeft className="size-5 text-foreground" />
            </button> */}
            <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
          </div>

          {/* Banner */}
          {showBanner && (
            <div className={cn(
              "mb-4 flex items-center gap-3 rounded-md border px-5 py-3.5",
              hasPayoutMethod
                ? "border-green-200 border-l-4 border-l-green-500 bg-green-50"
                : "border-yellow-200 border-l-4 border-l-yellow-400 bg-yellow-50"
            )}>
              {hasPayoutMethod ? (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-green-500">
                  <IconCheck className="size-3 text-green-600" strokeWidth={3} />
                </div>
              ) : (
                <IconAlertTriangle className="size-5 shrink-0 text-yellow-500" />
              )}
              <p className="flex-1 text-sm font-semibold text-foreground">
                {hasPayoutMethod ? (
                  <>Payout method configured. Your Bank Account ends in ***6789.{" "}
                    <a href="/settings" className="underline underline-offset-2 hover:text-[#F97316] transition-colors">Confirm</a>
                  </>
                ) : (
                  <>Your Payout method is not set up. Go to{" "}
                    <a href="/settings" className="underline underline-offset-2 hover:text-[#F97316] transition-colors font-bold">Settings</a>
                    {" "}to configure.
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

          {/* Balance cards */}
          <div className="rounded-md border bg-[#F5F2EF] mb-4 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Available Balance */}
              <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
                  <button
                    onClick={() => setShowAvailable((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAvailable ? <IconEye className="size-5" /> : <IconEyeOff className="size-5" />}
                  </button>
                </div>
                <p className="text-3xl font-bold text-foreground mb-5">
                  {showAvailable ? `$ ${AVAILABLE_BALANCE.toLocaleString()}` : "$ ••••••"}
                </p>
                {canWithdraw ? (
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full rounded-lg bg-[#1a1a1a] py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
                  >
                    Withdraw now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-lg bg-gray-200 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
                  >
                    Minimum payout is ${MIN_PAYOUT}
                  </button>
                )}
              </div>

              {/* Pending Release Balance */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Pending Release Balance</span>
                  <button
                    onClick={() => setShowPending((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPending ? <IconEye className="size-5" /> : <IconEyeOff className="size-5" />}
                  </button>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {showPending ? `$ ${PENDING_BALANCE.toLocaleString()}` : "$ ••••••"}
                </p>
              </div>
            </div>
          </div>

          {/* Payout History */}
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
              <div className="flex flex-col items-center justify-center gap-4 py-12">
               <div className="flex items-center justify-center p-6 h-48 w-48 border rounded-full bg-[#EFEFEF]">
                  <img
                    src="/emptystate.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No payout history found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Your payout Information will appear here after initiating a withdraw
                </p>
                <button className="rounded-md bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors">
                  Add products
                </button>
              </div>
            }
          />
        </div>
      </SidebarInset>

      {/* Withdraw amount modal */}
      {showWithdrawModal && (
        <WithdrawModal
          availableBalance={AVAILABLE_BALANCE}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}

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