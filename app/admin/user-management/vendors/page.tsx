// app/admin/user-management/vendors/page.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  IconArrowLeft,
  IconSend,
  IconArrowRight,
  IconX,
  IconEdit,
  IconCheck,
  IconUser,
  IconPhone,
  IconMail,
  IconBuilding,
  IconCircleDashed,
  IconTrendingUp,
  IconCurrencyDollar,
  IconAlertCircle,
  IconUsers,
  IconClock,
  IconPlus,
  IconExternalLink,
  IconChevronDown,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUpIcon, Eye, PenLine } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";
import type { Vendor } from "@/redux/slices/adminVendorsSlice";
import PhoneField from "@/components/PhoneField";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";

// ─── Status helpers ───────────────────────────────────────────────────────────

type DisplayStatus =
  | "Active"
  | "Pending activation"
  | "Suspended"
  | "Deactivated"
  | "Deleted";

function toDisplayStatus(apiStatus: string): DisplayStatus {
  const map: Record<string, DisplayStatus> = {
    ACTIVE: "Active",
    PENDING: "Pending activation",
    PENDING_ACTIVATION: "Pending activation",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    INACTIVE: "Deactivated",
    DELETED: "Deleted",
  };
  return map[apiStatus?.toUpperCase()] ?? "Pending activation";
}

// ─── Vendor field helpers ─────────────────────────────────────────────────────

function getContactName(v: Vendor): string {
  return [v.firstName, v.lastName].filter(Boolean).join(" ") || "—";
}

function getBusinessName(v: Vendor): string {
  return v.profile?.businessName || v.businessName || "—";
}

function getPhone(v: Vendor): string {
  return v.phone || v.phoneNumber || "—";
}

function getDateJoined(v: Vendor): string {
  const raw = v.profile?.createdAt || v.createdAt;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-GB");
}

// ─── Action type ──────────────────────────────────────────────────────────────

type VendorActionValue = "ACTIVATE" | "SUSPENDED" | "ACTIVE";

// Status options shown inside the Change Status modal dropdown
const CHANGE_STATUS_OPTIONS: Record<DisplayStatus, { label: string; value: VendorActionValue }[]> = {
  "Pending activation": [
    { label: "Activate", value: "ACTIVATE" },
    { label: "Suspend",  value: "SUSPENDED" },
  ],
  Active: [
    { label: "Suspend", value: "SUSPENDED" },
  ],
  Suspended: [
    { label: "Reactivate", value: "ACTIVE" },
  ],
  Deactivated: [
    { label: "Reactivate", value: "ACTIVE" },
  ],
  Deleted: [],
};

// ─── Shared page shell ────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
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
    <svg
      className={cn("size-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  change,
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-5 text-white", gradient)}>
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M0 60 Q50 30 100 55 T200 45" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M0 75 Q60 45 120 65 T200 60" fill="none" stroke="white" strokeWidth="1" />
        <path d="M0 90 Q70 60 130 80 T200 75" fill="none" stroke="white" strokeWidth="0.75" />
      </svg>
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="shrink-0 rounded-lg bg-white/20 p-2">{icon}</div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4 mb-1">
              <TrendingUpIcon size={13} /> {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Status Badge (custom — Deleted is red text, no border) ─────────────

function VendorStatusBadge({ status }: { status: DisplayStatus }) {
  if (status === "Deleted") {
    return (
      <span className="text-xs font-semibold text-red-500">Deleted</span>
    );
  }
  if (status === "Pending activation") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-400 px-3 py-0.5 text-xs font-medium text-amber-600">
        Pending activation
      </span>
    );
  }
  if (status === "Active") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-500 px-3 py-0.5 text-xs font-medium text-green-700">
        Active
      </span>
    );
  }
  if (status === "Suspended") {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-800 px-3 py-0.5 text-xs font-semibold text-gray-800">
        Suspended
      </span>
    );
  }
  if (status === "Deactivated") {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-xs font-medium text-gray-400">
        Deactivated
      </span>
    );
  }
  return <StatusBadge status={status} />;
}

// ─── Action banners ───────────────────────────────────────────────────────────

function SuccessBanner({ message, subtitle, onDismiss }: { message: string; subtitle: string; onDismiss: () => void }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-4">
      <svg className="mt-0.5 size-5 shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-900">{message}</p>
        <p className="mt-0.5 text-xs text-green-700">{subtitle}</p>
      </div>
      <button onClick={onDismiss} className="shrink-0 text-green-400 hover:text-green-600 transition-colors">
        <IconX className="size-4" />
      </button>
    </div>
  );
}

function InfoBanner({ message, subtitle, onDismiss }: { message: string; subtitle: string; onDismiss: () => void }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50 px-5 py-4">
      <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-blue-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">{message}</p>
        <p className="mt-0.5 text-xs text-blue-700">{subtitle}</p>
      </div>
      <button onClick={onDismiss} className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors">
        <IconX className="size-4" />
      </button>
    </div>
  );
}

// ─── Change Status Modal ──────────────────────────────────────────────────────
// Matches images 5, 6, 7: centered dialog, dropdown showing current status,
// optional reason textarea for suspend, Cancel + Save buttons.

function ChangeStatusModal({
  vendor,
  onClose,
  onSave,
  isLoading,
}: {
  vendor: Vendor;
  onClose: () => void;
  onSave: (action: VendorActionValue, reason: string) => void;
  isLoading: boolean;
}) {
  const displayStatus = toDisplayStatus(vendor.status);
  const options = CHANGE_STATUS_OPTIONS[displayStatus] ?? [];

  const [selectedAction, setSelectedAction] = useState<VendorActionValue | "">(
    options[0]?.value ?? ""
  );
  const [reason, setReason] = useState("");

  const isSuspend = selectedAction === "SUSPENDED";
  const canSave = selectedAction !== "" && (!isSuspend || reason.trim().length > 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-bold text-foreground">Change Status</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Status dropdown — shows current status, opens to options */}
          <Select
            value={selectedAction}
            onValueChange={(v) => setSelectedAction(v as VendorActionValue)}
          >
            <SelectTrigger className="h-11 w-full rounded-lg border-gray-200 text-sm font-medium">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reason textarea — only when Suspend is selected */}
          {isSuspend && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Reason for suspension
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                placeholder="Provide a brief reason to why you're suspending this vendor's account"
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border-gray-200 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => canSave && !isLoading && onSave(selectedAction as VendorActionValue, reason)}
              disabled={!canSave || isLoading}
              className={cn(
                "flex-1 h-11 rounded-lg text-sm font-semibold text-white transition-all",
                canSave && !isLoading
                  ? "bg-[#F97316] hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 cursor-not-allowed pointer-events-none"
              )}
            >
              {isLoading ? <><Spinner /> Saving…</> : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vendor Sheet (right-side drawer) ────────────────────────────────────────
// Matches images 3, 5, 6, 7, 8:
//   - Logo circle at top (with vendor initial)
//   - Business name, "Joined {date}" in orange, status badge below
//   - "Business and Contact Info" + orange Edit button
//   - Info rows: Full Name, Phone, Email, Business Name, Status
//   - Net Revenue card
//   - For PENDING_ACTIVATION: full-width "Resend OTP" orange button
//   - For others: "Change Status" (red outline) + "View Full Details" (dark outline)

function VendorSheet({
  vendor,
  onClose,
  onStatusChanged,
  onResendOtp,
  onEdit,
  onViewFullDetails,
}: {
  vendor: Vendor;
  onClose: () => void;
  onStatusChanged: (vendorName: string, newStatus: DisplayStatus) => void;
  onResendOtp: (id: string) => void;
  onEdit: (vendor: Vendor) => void;
  onViewFullDetails: (vendor: Vendor) => void;
}) {
  const { changeVendorStatus, activateVendor, vendorsActionLoading, resendInvite } = useReduxAdmin();
  const [showStatusModal, setShowStatusModal] = useState(false);

  const displayStatus = toDisplayStatus(vendor.status);
  const vendorName = getBusinessName(vendor) || getContactName(vendor);
  const isPending = vendor.status === "PENDING_ACTIVATION" || vendor.status === "PENDING";
  const options = CHANGE_STATUS_OPTIONS[displayStatus] ?? [];
  const canChangeStatus = options.length > 0 && !isPending;

  const handleSaveStatus = async (action: VendorActionValue, reason: string) => {
    try {
      if (action === "ACTIVATE") {
        await activateVendor(vendor.id);
        onStatusChanged(vendorName, "Active");
      } else if (action === "SUSPENDED") {
        await changeVendorStatus(vendor.id, "SUSPENDED");
        onStatusChanged(vendorName, "Suspended");
      } else {
        await changeVendorStatus(vendor.id, "ACTIVE");
        onStatusChanged(vendorName, "Active");
      }
      setShowStatusModal(false);
      onClose();
    } catch {
      // toast already shown inside hook
    }
  };

  const infoRows: { Icon: React.ElementType; label: string; value: React.ReactNode }[] = [
    { Icon: IconUser,       label: "Full Name",      value: getContactName(vendor) },
    { Icon: IconPhone,      label: "Phone number",   value: getPhone(vendor) },
    { Icon: IconMail,       label: "Email Address",  value: vendor.email || "—" },
    { Icon: IconBuilding,   label: "Business Name",  value: getBusinessName(vendor) },
    {
      Icon: IconCircleDashed,
      label: "Status",
      value: (
        <span
          className={cn(
            "text-xs font-semibold",
            displayStatus === "Active" && "text-green-600",
            displayStatus === "Pending activation" && "text-amber-500",
            displayStatus === "Suspended" && "text-gray-800",
            displayStatus === "Deactivated" && "text-gray-400",
            displayStatus === "Deleted" && "text-red-500",
          )}
        >
          {displayStatus}
        </span>
      ),
    },
  ];

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] sm:max-w-[420px] p-0 overflow-y-auto flex flex-col gap-0"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-full border border-gray-200 size-8 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors bg-white"
          >
            <IconX className="size-4" />
          </button>

          {/* Logo + name header */}
          <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-gray-100">
            {/* Logo circle */}
            <div className="size-28 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-white overflow-hidden mb-4">
              <span className="text-4xl font-bold text-gray-300 select-none">
                {vendorName[0]?.toUpperCase() ?? "V"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{vendorName}</h2>
            <p className="text-sm font-medium text-[#F97316] mt-0.5">
              Joined {getDateJoined(vendor)}
            </p>
            <div className="mt-2">
              <VendorStatusBadge status={displayStatus} />
            </div>
          </div>

          {/* Business & Contact Info */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Business and Contact Info</h3>
              <Button
                onClick={() => { onEdit(vendor); onClose(); }}
                className="h-8 gap-1.5 rounded-md bg-[#F97316] px-3 text-xs font-semibold text-white hover:bg-[#F97316]/90"
              >
                Edit <PenLine className="size-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {infoRows.map(({ Icon, label, value }) => (
                <div key={label} className="grid grid-cols-[140px_1fr] items-start gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-3.5 shrink-0 text-gray-400" />
                    {label}
                  </div>
                  <div className="text-sm text-foreground font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Net Revenue card */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                <div className="flex items-center justify-center rounded-lg bg-[#F97316] p-1.5">
                  <IconCurrencyDollar className="size-4 text-white" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">
                  ${(vendor.revenue ?? 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <IconTrendingUp className="size-4" />
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 py-5 mt-auto">
            {isPending ? (
              /* Pending activation: full-width Resend OTP */
              <Button
                onClick={() => resendInvite(vendor.id)}
                disabled={vendorsActionLoading}
                className="w-full h-11 rounded-lg bg-[#F97316] text-sm font-semibold text-white hover:bg-[#F97316]/90"
              >
                {vendorsActionLoading ? <><Spinner /> Sending…</> : "Resend OTP"}
              </Button>
            ) : (
              /* Other statuses: Change Status + View Full Details */
              <div className="flex items-center gap-3">
                {canChangeStatus && (
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusModal(true)}
                    disabled={vendorsActionLoading}
                    className="flex-1 h-11 rounded-lg border-red-400 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-500"
                  >
                    Change Status
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => { onViewFullDetails(vendor); onClose(); }}
                  className="flex-1 h-11 rounded-lg border-gray-200 text-foreground text-sm font-semibold hover:bg-gray-50 gap-1.5"
                >
                  View Full Details
                  <IconExternalLink className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Change Status modal — renders on top of the sheet */}
      {showStatusModal && (
        <ChangeStatusModal
          vendor={vendor}
          onClose={() => setShowStatusModal(false)}
          onSave={handleSaveStatus}
          isLoading={vendorsActionLoading}
        />
      )}
    </>
  );
}

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold text-[#F97316]">
        Section {step === 1 ? "one" : "two"}
      </p>
      <div className="flex gap-2">
        <div className="h-1.5 flex-1 max-w-[130px] rounded-full bg-[#F97316]" />
        <div className={cn("h-1.5 flex-1 max-w-[130px] rounded-full transition-all", step === 2 ? "bg-[#F97316]" : "bg-gray-200")} />
      </div>
    </div>
  );
}

// ─── Edit vendor form ─────────────────────────────────────────────────────────

function EditVendorForm({
  vendor,
  onClose,
  onSaved,
}: {
  vendor: Vendor;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { editVendor, vendorsActionLoading } = useReduxAdmin();
  const [step, setStep] = useState<1 | 2>(1);
  const [bn, setBn] = useState(vendor.profile?.businessName || vendor.businessName || "");
  const [fn, setFn] = useState(vendor.firstName ?? "");
  const [ln, setLn] = useState(vendor.lastName ?? "");
  const [email, setEmail] = useState(vendor.email ?? "");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState((vendor.phone || vendor.phoneNumber || "").replace(/^\+\d{1,3}/, ""));
  const [cc, setCc] = useState("256");

  const s1ok = bn.trim().length > 0;
  const s2ok = !!(fn.trim() && ln.trim() && email.trim() && !emailErr);

  const validateEmail = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address");
    } else {
      setEmailErr("");
    }
  };

  const handleSave = async () => {
    if (!s2ok) return;
    try {
      await editVendor(vendor.id, {
        businessName: bn.trim() || undefined,
        contactFirstName: fn.trim(),
        contactLastName: ln.trim(),
        email: email.trim(),
        contactPhone: phone.trim() ? `+${cc}${phone.trim()}` : undefined,
      });
      onSaved();
    } catch {
      // toast already fired
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center gap-2">
          <button onClick={onClose} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Edit Vendor</h1>
        </div>

        <div className="w-full rounded-xl border bg-white p-6">
          <StepBar step={step} />

          {step === 1 && (
            <>
              <h2 className="mb-5 text-xl font-semibold text-foreground">Business Details</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Business Name <span className="text-[#F97316]">*</span>
                </label>
                <Input
                  value={bn}
                  onChange={(e) => setBn(e.target.value)}
                  className="h-11 w-full rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-5 text-xl font-semibold text-foreground">Contact Person</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input value={fn} onChange={(e) => setFn(e.target.value)} className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input value={ln} onChange={(e) => setLn(e.target.value)} className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">* {emailErr}</span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
                    onBlur={validateEmail}
                    className={cn("h-11 rounded-lg focus-visible:ring-[#F97316]", emailErr ? "border-red-500" : "border-gray-300")}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <PhoneField phone={phone} setPhone={setPhone} cc={cc} setCc={setCc} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!s1ok}
              className={cn("h-11 px-7 gap-2 rounded-md font-semibold", s1ok ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none")}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex items-center w-full justify-between gap-3">
              <Button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors border border-gray-200 rounded-lg px-12 h-11 bg-white hover:bg-gray-50">
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={!s2ok || vendorsActionLoading}
                className={cn("h-11 px-7 gap-2 rounded-md font-semibold", s2ok && !vendorsActionLoading ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none")}
              >
                {vendorsActionLoading ? <><Spinner /> Saving…</> : <><IconCheck className="size-4" /> Save Changes</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Create vendor form ───────────────────────────────────────────────────────

function CreateVendorForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (email: string) => void;
}) {
  const { addVendor, vendorsActionLoading } = useReduxAdmin();
  const [step, setStep] = useState<1 | 2>(1);
  const [bn, setBn] = useState("");
  const [fn, setFn] = useState("");
  const [ln, setLn] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [cc, setCc] = useState("256");

  const s1ok = bn.trim().length > 0;
  const s2ok = !!(fn.trim() && ln.trim() && email.trim() && !emailErr);

  const validateEmail = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address");
    } else {
      setEmailErr("");
    }
  };

  const submit = async () => {
    if (!s2ok) return;
    try {
      await addVendor({
        businessName: bn.trim(),
        contactFirstName: fn.trim(),
        contactLastName: ln.trim(),
        email: email.trim(),
        contactPhone: phone.trim() ? `+${cc}${phone.trim()}` : undefined,
      });
      onSuccess(email.trim());
    } catch {
      // toast already fired
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center gap-2">
          <button onClick={onClose} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Create Vendor</h1>
        </div>

        <div className="w-full rounded-xl border bg-white p-6">
          <StepBar step={step} />

          {step === 1 && (
            <>
              <h2 className="mb-5 text-xl font-semibold text-foreground">Business Details</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Business Name <span className="text-[#F97316]">*</span>
                </label>
                <Input value={bn} onChange={(e) => setBn(e.target.value)} className="h-11 w-full rounded-lg border-gray-300 focus-visible:ring-[#F97316]" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-5 text-xl font-semibold text-foreground">Contact Person</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input value={fn} onChange={(e) => setFn(e.target.value)} className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input value={ln} onChange={(e) => setLn(e.target.value)} className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">* {emailErr}</span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
                    onBlur={validateEmail}
                    className={cn("h-11 rounded-lg focus-visible:ring-[#F97316]", emailErr ? "border-red-500" : "border-gray-300")}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <PhoneField phone={phone} setPhone={setPhone} cc={cc} setCc={setCc} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!s1ok}
              className={cn("h-11 px-7 gap-2 rounded-md font-semibold", s1ok ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none")}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={submit}
              disabled={!s2ok || vendorsActionLoading}
              className={cn("h-11 px-7 gap-2 rounded-md font-semibold", s2ok && !vendorsActionLoading ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none")}
            >
              {vendorsActionLoading ? <><Spinner /> Sending…</> : <><IconSend className="size-4" /> Invite Vendor</>}
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Email sent screen ────────────────────────────────────────────────────────

function EmailSentScreen({ email, onOk }: { email: string; onOk: () => void }) {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center p-8 bg-[#F7F7F7] min-h-screen">
        <div className="w-full max-w-[480px] rounded-2xl border bg-[#fef8f0] px-12 py-10 text-center flex flex-col items-center">
          <div className="relative h-48 w-64 flex items-center justify-center overflow-hidden">
            <img src="/email-sent.png" alt="Email Sent" className="h-full w-full object-cover" />
          </div>
          <p className="mt-6 text-[15px] leading-relaxed text-foreground">
            An invitation has been sent to the vendor email{" "}
            <span className="font-bold">{email}</span>
          </p>
          <Button
            onClick={onOk}
            className="mt-7 h-11 w-24 rounded-lg bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333]"
          >
            OK
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Vendors list page ────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type BannerState = {
  type: "success" | "info";
  message: string;
  subtitle: string;
} | null;

function VendorsListPage({
  onCreateVendor,
  onEdit,
  onViewFullDetails,
  showEditSuccessBanner,
  onDismissEditBanner,
}: {
  onCreateVendor: () => void;
  onEdit: (vendor: Vendor) => void;
  onViewFullDetails: (vendor: Vendor) => void;
  showEditSuccessBanner?: boolean;
  onDismissEditBanner?: () => void;
}) {
  const { vendors, vendorsLoading, vendorsTotal, loadVendors, resendInvite } = useReduxAdmin();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadVendors({ page: 1, limit: PAGE_SIZE, search: search || undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadVendors({ page: currentPage, limit: PAGE_SIZE, search: search || undefined });
  }, [currentPage]);

  const activeCount  = vendors.filter((v) => v.status === "ACTIVE").length;
  const pendingCount = vendors.filter((v) => v.status === "PENDING_ACTIVATION" || v.status === "PENDING").length;
  const totalRevenue = vendors.reduce((sum, v) => sum + (v.revenue ?? 0), 0);

  const handleStatusChanged = (vendorName: string, newStatus: DisplayStatus) => {
    setSelectedVendor(null);

    if (newStatus === "Suspended") {
      setBanner({
        type: "info",
        message: "Vendor account has been suspended",
        subtitle: `The reason for suspending "${vendorName}" has been sent to their email`,
      });
    } else if (newStatus === "Active") {
      setBanner({
        type: "success",
        message: "Vendor account is now active!",
        subtitle: `The vendor account "${vendorName}" is now active`,
      });
    }

    loadVendors({ page: currentPage, limit: PAGE_SIZE, search: search || undefined });
  };

  const columns: ColumnDef<Vendor>[] = [
    {
      id: "contactPerson",
      accessorFn: (v) => getContactName(v),
      header: "Contact Person",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{getContactName(row.original)}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "businessName",
      accessorFn: (v) => getBusinessName(v),
      header: "Business Name",
      cell: ({ row }) => <span className="text-foreground">{getBusinessName(row.original)}</span>,
    },
    {
      id: "dateJoined",
      accessorFn: (v) => getDateJoined(v),
      header: "Date Joined",
      cell: ({ row }) => <span className="text-foreground">{getDateJoined(row.original)}</span>,
    },
    {
      id: "status",
      accessorFn: (v) => v.status,
      header: "Status",
      cell: ({ row }) => <VendorStatusBadge status={toDisplayStatus(row.original.status)} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedVendor(row.original)}
            className="text-gray-400 hover:text-[#F97316] transition-colors"
            title="View"
          >
            <Eye className="size-5" />
          </button>
          <button
            onClick={() => onEdit(row.original)}
            className="text-gray-400 hover:text-[#F97316] transition-colors"
            title="Edit"
          >
            <PenLine className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: "Total Vendors",
      value: vendorsTotal || 0,
      change: "+15%",
      icon: <IconUsers className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active Vendors",
      value: activeCount,
      change: "+10%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Pending Activation",
      value: pendingCount,
      change: "+5%",
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+12%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
        <h1 className="mb-5 text-2xl font-bold text-foreground">Vendors</h1>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* Edit success banner */}
        {showEditSuccessBanner && (
          <SuccessBanner
            message="Vendor details have been updated successfully"
            subtitle="The changes have been saved and are now live"
            onDismiss={() => onDismissEditBanner?.()}
          />
        )}

        {/* Status action banner */}
        {banner && (
          banner.type === "success" ? (
            <SuccessBanner
              message={banner.message}
              subtitle={banner.subtitle}
              onDismiss={() => setBanner(null)}
            />
          ) : (
            <InfoBanner
              message={banner.message}
              subtitle={banner.subtitle}
              onDismiss={() => setBanner(null)}
            />
          )
        )}

        {/* Table */}
        <div className="rounded-xl bg-white">
          <DataTable
            columns={columns}
            data={vendors}
            title="All Vendors"
            description="Manage and monitor all vendors on the platform"
            headerAction={
              <Button
                onClick={onCreateVendor}
                className="h-9 gap-1.5 rounded-lg bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#F97316]/90"
              >
                <IconPlus className="size-3.5" /> Create Vendor
              </Button>
            }
            searchColumn="contactPerson"
            searchPlaceholder="Search"
            showFilters
            showSort
            sortLabel="Upload Date"
            showSelection
            showPagination
            loading={vendorsLoading}
            pageSize={PAGE_SIZE}
            total={vendorsTotal}
            page={currentPage}
            onPageChange={setCurrentPage}
            emptyState={
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="flex flex-col items-center justify-center gap-4 p-6 h-40 w-40 border rounded-full bg-[#EFEFEF]">
                  <img src="/emptystate.png" alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-1 text-lg font-semibold text-foreground">No vendors yet!</h3>
                <p className="text-sm text-muted-foreground">Add a new vendor by clicking the button below</p>
                <Button
                  onClick={onCreateVendor}
                  className="mt-2 h-9 px-8 rounded-md bg-[#F97316] text-sm font-semibold text-white hover:bg-[#F97316]/90"
                >
                  Add Vendor
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Sheet drawer */}
      {selectedVendor && (
        <VendorSheet
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onStatusChanged={handleStatusChanged}
          onResendOtp={(id) => resendInvite(id)}
          onEdit={onEdit}
          onViewFullDetails={onViewFullDetails}
        />
      )}
    </PageShell>
  );
}

// ─── Vendor Detail Page ───────────────────────────────────────────────────────

type DetailTab = "dashboard" | "products" | "financials" | "auditlogs";

// Mock product type for the products tab
interface VendorProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  image?: string;
}

// Mock chart data
const MOCK_SALES_TREND = [
  { month: "May", value: 300000 },
  { month: "Jun", value: 250000 },
  { month: "Jul", value: 380000 },
  { month: "Aug", value: 310000 },
  { month: "Sep", value: 400000 },
  { month: "Oct", value: 350000 },
  { month: "Nov", value: 420000 },
  { month: "Dec", value: 520000 },
  { month: "Jan", value: 480000 },
  { month: "Feb", value: 560000 },
];

const MOCK_PRODUCT_PERFORMANCE = [
  { name: "Kampala Nites", pct: 46, color: "#F97316" },
  { name: "Esm School Manager", pct: 25, color: "#1a1a1a" },
  { name: "Safe-Jaj App", pct: 16, color: "#d4b896" },
  { name: "Savanna Records", pct: 8, color: "#7c6b5a" },
  { name: "Creative Class", pct: 5, color: "#c8b8a8" },
];

const MOCK_PRODUCTS: VendorProduct[] = [
  { id: "1", name: "Kampala Niles App", price: 20000, status: "ACTIVE", image: "/product-placeholder.png" },
  { id: "2", name: "The Night I fell in Love-ebook", price: 1200000, status: "ACTIVE", image: "/product-placeholder.png" },
  { id: "3", name: "Kavuma's Creative Class", price: 400000, status: "DELETED", image: "/product-placeholder.png" },
  { id: "4", name: "Wedding Photography", price: 50000, status: "PENDING_RE_APPROVAL", image: "/product-placeholder.png" },
  { id: "5", name: "Safe-jaj app", price: 10000, status: "SUSPENDED", image: "/product-placeholder.png" },
  { id: "6", name: "Betrayed by my leader - ebook", price: 300000, status: "DEACTIVATED", image: "/product-placeholder.png" },
  { id: "7", name: "ESM School Manager", price: 800000, status: "DELETED", image: "/product-placeholder.png" },
  { id: "8", name: "Savanna Records", price: 100000, status: "ACTIVE", image: "/product-placeholder.png" },
  { id: "9", name: "Chimpman Deliveries", price: 250000, status: "SUSPENDED", image: "/product-placeholder.png" },
  { id: "10", name: "Lawya Lens Consultancy", price: 300000, status: "DEACTIVATED", image: "/product-placeholder.png" },
];

function ProductStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "DELETED") return <span className="text-xs font-semibold text-red-500">Deleted</span>;
  if (s === "ACTIVE") return <span className="inline-flex items-center rounded-full border border-green-500 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>;
  if (s === "SUSPENDED") return <span className="inline-flex items-center rounded-full border border-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-800">Suspended</span>;
  if (s === "DEACTIVATED") return <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-400">Deactivated</span>;
  if (s.includes("RE_APPROVAL") || s.includes("PENDING")) return <span className="inline-flex items-center rounded-full border border-amber-400 px-2.5 py-0.5 text-xs font-medium text-amber-600">Pending re-approval</span>;
  return <span className="text-xs text-gray-500">{status}</span>;
}

// Simple SVG area chart
function SalesChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const W = 600, H = 200, PAD = 40;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.value / max) * (H - PAD * 2));
    return { x, y, ...d };
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;
  const yLabels = [0, 100000, 200000, 300000, 400000, 500000, 600000];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ minWidth: 300 }}>
        {/* Y axis labels */}
        {yLabels.map((v) => {
          const y = H - PAD - ((v / max) * (H - PAD * 2));
          return (
            <g key={v}>
              <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#aaa">
                {v >= 1000 ? `${v / 1000}k` : v}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" />
        {/* X axis labels */}
        {pts.map((p) => (
          <text key={p.month} x={p.x} y={H + 14} textAnchor="middle" fontSize="9" fill="#aaa">
            {p.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

// Simple SVG donut chart
function DonutChart({ data }: { data: { name: string; pct: number; color: string }[] }) {
  const R = 60, cx = 90, cy = 80, stroke = 28;
  let cumAngle = -90;
  const segments = data.map((d) => {
    const angle = (d.pct / 100) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, endAngle: cumAngle };
  });

  function polarToXY(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const s = polarToXY(cx, cy, r, startDeg);
    const e = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <svg viewBox="0 0 180 160" className="w-full max-w-[180px] mx-auto">
        {segments.map((seg) => (
          <path
            key={seg.name}
            d={arcPath(cx, cy, R, seg.startAngle, seg.endAngle)}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-foreground">{d.name}</span>
            </div>
            <span className="font-semibold text-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail page stat card (3-up, orange gradient variants)
function DetailStatCard({ title, value, gradient, icon }: {
  title: string;
  value: string | number;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl p-5 text-white", gradient)}>
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M0 60 Q50 30 100 55 T200 45" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M0 75 Q60 45 120 65 T200 60" fill="none" stroke="white" strokeWidth="1" />
      </svg>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="shrink-0 rounded-lg bg-white/20 p-2">{icon}</div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function VendorDetailPage({
  vendor,
  onClose,
  onEdit,
  onStatusChanged,
}: {
  vendor: Vendor;
  onClose: () => void;
  onEdit: (vendor: Vendor) => void;
  onStatusChanged: () => void;
}) {
  const { changeVendorStatus, activateVendor, vendorsActionLoading } = useReduxAdmin();

  const [activeTab, setActiveTab] = useState<DetailTab>("dashboard");
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<VendorActionValue | "">("");
  const [suspendReason, setSuspendReason] = useState("");
  const [productPage, setProductPage] = useState(1);

  const displayStatus = toDisplayStatus(vendor.status);
  const vendorName = getBusinessName(vendor) || getContactName(vendor);
  const options = CHANGE_STATUS_OPTIONS[displayStatus] ?? [];
  const isSuspend = selectedAction === "SUSPENDED";
  const canSave = selectedAction !== "" && (!isSuspend || suspendReason.trim().length > 0);

  const handleSaveStatus = async () => {
    try {
      if (selectedAction === "ACTIVATE") {
        await activateVendor(vendor.id);
      } else if (selectedAction === "SUSPENDED") {
        await changeVendorStatus(vendor.id, "SUSPENDED");
      } else if (selectedAction === "ACTIVE") {
        await changeVendorStatus(vendor.id, "ACTIVE");
      }
      setStatusOpen(false);
      setSelectedAction("");
      setSuspendReason("");
      onStatusChanged();
    } catch {
      // toast shown inside hook
    }
  };

  const TABS: { key: DetailTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "financials", label: "Financials" },
    { key: "auditlogs", label: "Audit Logs" },
  ];

  const productColumns: ColumnDef<VendorProduct>[] = [
    {
      id: "picture",
      header: "Picture",
      cell: ({ row }) => (
        <div className="size-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
          {row.original.image ? (
            <img src={row.original.image} alt={row.original.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Product name",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Price (USD)",
      cell: ({ row }) => <span className="text-foreground">{row.original.price.toLocaleString()}</span>,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#F97316] transition-colors">
          <Eye className="size-4" /> View
        </button>
      ),
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <button onClick={onClose} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Vendor Details</h1>
        </div>

        {/* Profile + Contact card */}
        <div className="rounded-xl bg-white border border-gray-100 p-6 mb-5">
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Left: logo + name */}
            <div className="flex flex-col items-center sm:w-56 shrink-0 gap-2">
              <div className="size-32 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-white overflow-hidden">
                <span className="text-5xl font-bold text-gray-200 select-none">
                  {vendorName[0]?.toUpperCase() ?? "V"}
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground text-center">{vendorName}</p>
              <p className="text-sm text-muted-foreground">Joined {getDateJoined(vendor)}</p>
              <VendorStatusBadge status={displayStatus} />
            </div>

            {/* Vertical divider */}
            <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

            {/* Right: info + actions */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground mb-4">Business and Contact Info</h3>
              <div className="space-y-3 mb-6">
                {[
                  { Icon: IconUser,     label: "Full Name",     value: getContactName(vendor) },
                  { Icon: IconPhone,    label: "Phone number",  value: getPhone(vendor) },
                  { Icon: IconMail,     label: "Email Address", value: vendor.email || "—" },
                  { Icon: IconBuilding, label: "Business Name", value: getBusinessName(vendor) },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="grid grid-cols-[180px_1fr] items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="size-4 shrink-0 text-gray-400" />
                      {label}
                    </div>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Change Status + Edit row */}
              <div className="flex items-start gap-3 flex-wrap">
                {options.length > 0 && (
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <button
                      onClick={() => { setStatusOpen((o) => !o); setSelectedAction(options[0]?.value ?? ""); }}
                      className="flex w-full items-center justify-between h-11 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-foreground bg-white hover:border-gray-300 transition-colors"
                    >
                      Change Status
                      <IconChevronDown className="size-4 text-gray-400" />
                    </button>

                    {/* Inline dropdown panel */}
                    {statusOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-100 bg-white shadow-xl z-20 p-4 space-y-3">
                        {/* Action selector */}
                        <Select
                          value={selectedAction}
                          onValueChange={(v) => setSelectedAction(v as VendorActionValue)}
                        >
                          <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 text-sm">
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Reason textarea — only for suspend */}
                        {isSuspend && (
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">Reason for suspension</label>
                            <textarea
                              value={suspendReason}
                              onChange={(e) => setSuspendReason(e.target.value)}
                              rows={4}
                              placeholder="Provide a brief reason to why you're suspending this vendor's account"
                              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => { setStatusOpen(false); setSelectedAction(""); setSuspendReason(""); }} className="flex-1 h-9 rounded-lg text-sm font-semibold border-gray-200">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveStatus}
                            disabled={!canSave || vendorsActionLoading}
                            className={cn("flex-1 h-9 rounded-lg text-sm font-semibold text-white", canSave && !vendorsActionLoading ? "bg-[#F97316] hover:bg-[#F97316]/90" : "bg-[#F97316]/40 cursor-not-allowed pointer-events-none")}
                          >
                            {vendorsActionLoading ? <Spinner /> : "Save"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => onEdit(vendor)}
                  className="h-11 gap-1.5 rounded-lg bg-[#F97316] px-5 text-sm font-semibold text-white hover:bg-[#F97316]/90"
                >
                  Edit <PenLine className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 mb-5 bg-white rounded-xl px-2 overflow-x-auto overflow-y-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key
                  ? "text-[#F97316] border-b-2 border-[#F97316] -mb-px font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Dashboard tab ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* 3 stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DetailStatCard
                title="Total Active Products"
                value={0}
                gradient="bg-gradient-to-br from-[#F97316] to-[#ea6a0a]"
                icon={<IconUsers className="size-5 text-white" />}
              />
              <DetailStatCard
                title="Total Gross Sales"
                value={0}
                gradient="bg-gradient-to-br from-[#c05f10] to-[#a84f0a]"
                icon={<IconTrendingUp className="size-5 text-white" />}
              />
              <DetailStatCard
                title="Total sales"
                value="$0"
                gradient="bg-gradient-to-br from-[#6b3a10] to-[#4a2808]"
                icon={<IconCurrencyDollar className="size-5 text-white" />}
              />
            </div>

            {/* Vendor's Dashboard section */}
            <div className="rounded-xl bg-white border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-foreground mb-0.5">Vendor's Dashboard</h3>
              <p className="text-xs text-muted-foreground mb-4">View the vendor's general performance</p>

              {/* Search/filter bar */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="relative w-full max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input placeholder="Search" className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground">
                  <button className="flex items-center gap-1.5 hover:text-[#F97316] transition-colors">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                    Filters
                  </button>
                  <span>Sort by: <span className="text-[#F97316] font-medium">Ascending</span></span>
                  <svg className="size-4 text-[#F97316]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20H4M20 4H4M15 12H4" /></svg>
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
                {/* Sales & Earnings Trend */}
                <div className="rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Sales &amp; Earnings Trend</h4>
                      <p className="text-xs text-muted-foreground">Is my business growing? Am I making more?</p>
                    </div>
                    <button className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-foreground hover:border-gray-300 transition-colors">
                      Filter by date
                      <IconChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <SalesChart data={MOCK_SALES_TREND} />
                </div>

                {/* Product Performance */}
                <div className="rounded-xl border border-gray-100 p-5">
                  <h4 className="text-sm font-bold text-foreground mb-0.5">Product Performance</h4>
                  <p className="text-xs text-muted-foreground mb-4">Which Products Are My Best Sellers?</p>
                  <DonutChart data={MOCK_PRODUCT_PERFORMANCE} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Products tab ── */}
        {activeTab === "products" && (
          <div className="rounded-xl bg-white">
            <DataTable
              columns={productColumns}
              data={MOCK_PRODUCTS}
              title="Vendor's products"
              description="List of products the vendor has uploaded"
              searchColumn="name"
              searchPlaceholder="Search"
              showFilters
              showSort
              sortLabel="Ascending"
              showSelection
              showPagination
              pageSize={10}
              total={MOCK_PRODUCTS.length}
              page={productPage}
              onPageChange={setProductPage}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-sm">
                  No products found
                </div>
              }
            />
          </div>
        )}

        {/* ── Financials tab ── */}
        {activeTab === "financials" && (
          <div className="rounded-xl bg-white border border-gray-100 p-8 flex items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground text-sm">Financial data will appear here</p>
          </div>
        )}

        {/* ── Audit Logs tab ── */}
        {activeTab === "auditlogs" && (
          <div className="rounded-xl bg-white border border-gray-100 p-8 flex items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground text-sm">Audit log data will appear here</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

// Need IconChevronDown for the detail page inline dropdown — already imported above

type View = "list" | "create" | "success" | "edit" | "edit-success" | "detail";

export default function VendorsPage() {
  const [view, setView] = useState<View>("list");
  const [successEmail, setSuccessEmail] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);

  const handleCreateSuccess = useCallback((email: string) => {
    setSuccessEmail(email);
    setView("success");
  }, []);

  const handleEdit = useCallback((vendor: Vendor) => {
    setEditingVendor(vendor);
    setView("edit");
  }, []);

  const handleEditSaved = useCallback(() => {
    setEditingVendor(null);
    setView("edit-success");
  }, []);

  const handleViewFullDetails = useCallback((vendor: Vendor) => {
    setDetailVendor(vendor);
    setView("detail");
  }, []);

  if (view === "create")
    return <CreateVendorForm onClose={() => setView("list")} onSuccess={handleCreateSuccess} />;

  if (view === "success")
    return <EmailSentScreen email={successEmail} onOk={() => setView("list")} />;

  if (view === "edit" && editingVendor)
    return <EditVendorForm vendor={editingVendor} onClose={() => setView(detailVendor ? "detail" : "list")} onSaved={handleEditSaved} />;

  if (view === "detail" && detailVendor)
    return (
      <VendorDetailPage
        vendor={detailVendor}
        onClose={() => { setDetailVendor(null); setView("list"); }}
        onEdit={(v) => { setEditingVendor(v); setView("edit"); }}
        onStatusChanged={() => {}}
      />
    );

  return (
    <VendorsListPage
      onCreateVendor={() => setView("create")}
      onEdit={handleEdit}
      onViewFullDetails={handleViewFullDetails}
      showEditSuccessBanner={view === "edit-success"}
      onDismissEditBanner={() => setView("list")}
    />
  );
}