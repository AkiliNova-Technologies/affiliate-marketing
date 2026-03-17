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
  IconCircleDashed,
  IconTrendingUp,
  IconCurrencyDollar,
  IconAlertCircle,
  IconBan,
  IconUsers,
  IconClock,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 text-white",
        gradient,
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
            <p className="text-sm font-medium text-white/80">{title}</p>
            <div className="shrink-0 rounded-lg bg-white/20 p-2">{icon}</div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4">
                <TrendingUpIcon size={14} /> {change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function EnvelopeIllustration() {
  return (
    <div className="relative h-48 w-68 flex items-center justify-center overflow-hidden">
      <img
        src="/email-sent.png"
        alt="Email Sent Illustration"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// ─── Action banner ────────────────────────────────────────────────────────────

function VendorActionBanner({
  message,
  subtitle,
  onDismiss,
}: {
  message: string;
  subtitle: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border-l-4 border-l-blue-500 border border-blue-100 bg-blue-50 px-5 py-4">
      <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-blue-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">{message}</p>
        <p className="mt-0.5 text-xs text-blue-700">{subtitle}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
      >
        <IconX className="size-4" />
      </button>
    </div>
  );
}

// ─── Suspend modal ────────────────────────────────────────────────────────────

function SuspendModal({
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
      <div className="w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-foreground">
            Do you want to suspend this vendor?
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-semibold text-foreground">
            Reason for suspension
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Provide a brief reason to why you're suspending this vendor's
            account
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
          />
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => ok && !isLoading && onConfirm(reason)}
            disabled={!ok || isLoading}
            className={cn(
              "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all",
              ok && !isLoading
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed pointer-events-none",
            )}
          >
            {isLoading ? (
              <>
                <Spinner /> Suspending…
              </>
            ) : (
              <>
                Suspend Vendor <IconBan className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor drawer ────────────────────────────────────────────────────────────

const STATUS_ACTIONS: Record<
  DisplayStatus,
  Array<{ label: string; apiStatus: "ACTIVE" | "SUSPENDED"; danger?: boolean }>
> = {
  Active: [{ label: "Suspend", apiStatus: "SUSPENDED", danger: true }],
  "Pending activation": [
    { label: "Activate", apiStatus: "ACTIVE" },
    { label: "Suspend", apiStatus: "SUSPENDED", danger: true },
  ],
  Suspended: [{ label: "Activate", apiStatus: "ACTIVE" }],
  Deactivated: [{ label: "Activate", apiStatus: "ACTIVE" }],
  Deleted: [],
};

function VendorDrawer({
  vendor,
  onClose,
  onStatusChanged,
  onResendOtp,
  onEdit,
}: {
  vendor: Vendor;
  onClose: () => void;
  onStatusChanged: (vendorName: string, newStatus: DisplayStatus) => void;
  onResendOtp: (id: string) => void;
  onEdit: (vendor: Vendor) => void;
}) {
  const { changeVendorStatus, vendorsActionLoading } = useReduxAdmin();
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const displayStatus = toDisplayStatus(vendor.status);
  const actions = STATUS_ACTIONS[displayStatus] ?? [];
  const showOtp = displayStatus === "Pending activation";
  const vendorName = getBusinessName(vendor) || getContactName(vendor);

  const handleSelectAction = (apiStatus: "ACTIVE" | "SUSPENDED") => {
    if (apiStatus === "SUSPENDED") {
      setShowSuspendModal(true);
    } else {
      doStatusChange(apiStatus);
    }
  };

  const doStatusChange = async (
    apiStatus: "ACTIVE" | "SUSPENDED",
    _reason?: string,
  ) => {
    try {
      await changeVendorStatus(vendor.id, apiStatus);
      onStatusChanged(
        vendorName,
        apiStatus === "ACTIVE" ? "Active" : "Suspended",
      );
      onClose();
    } catch {
      // toast already fired inside changeVendorStatus
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-full border border-gray-200 size-8 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <IconX className="size-4" />
          </button>

          <div className="p-8 pt-16 pb-16 max-h-[90vh] overflow-y-auto">
            <div className="flex gap-6 mb-6">
              <div className="shrink-0 size-[140px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-bold text-gray-300 select-none">
                  {vendorName[0]?.toUpperCase() ?? "V"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {vendorName}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-[#F97316]">
                      Joined {getDateJoined(vendor)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4" />

                <div className="grid grid-cols-1 gap-x-8 gap-y-3 mb-4">
                  {[
                    {
                      Icon: IconUser,
                      label: "Contact Person",
                      value: getContactName(vendor),
                    },
                    {
                      Icon: IconPhone,
                      label: "Phone number",
                      value: getPhone(vendor),
                    },
                    {
                      Icon: IconMail,
                      label: "Email Address",
                      value: vendor.email || "—",
                    },
                    {
                      Icon: IconCircleDashed,
                      label: "Status",
                      value: <StatusBadge status={displayStatus} />,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="grid grid-cols-2 items-start gap-2.5"
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="size-4 shrink-0 text-gray-400 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                      <div className="text-sm text-foreground mt-0.5">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Net Revenue
                    </p>
                    <div className="flex items-center justify-center rounded-lg bg-[#F97316] p-1.5">
                      <IconCurrencyDollar className="size-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-2xl font-bold text-foreground">
                      $
                      {(
                        vendor.revenue ??
                        vendor.productsCount ??
                        0
                      ).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <IconTrendingUp className="size-4" />
                      <span>—</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    onClick={() => {
                      onEdit(vendor);
                      onClose();
                    }}
                    className="h-10 gap-2 rounded-md bg-[#F97316] px-5 text-sm font-semibold text-white hover:bg-[#F97316]/90"
                  >
                    Edit <IconEdit className="size-4" />
                  </Button>

                  {actions.length > 0 && (
                    <Select
                      onValueChange={(v) =>
                        handleSelectAction(v as "ACTIVE" | "SUSPENDED")
                      }
                      disabled={vendorsActionLoading}
                    >
                      <SelectTrigger className="w-[160px] min-h-10 rounded-md border-gray-200 text-sm font-semibold">
                        <SelectValue
                          placeholder={
                            vendorsActionLoading ? "Updating…" : "Change Status"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((a) => (
                          <SelectItem
                            key={a.apiStatus}
                            value={a.apiStatus}
                            className={cn(
                              a.danger && "text-red-500 font-medium",
                            )}
                          >
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {showOtp && (
                    <button
                      onClick={() => onResendOtp(vendor.id)}
                      disabled={vendorsActionLoading}
                      className="ml-auto text-sm font-semibold underline underline-offset-2 text-foreground hover:text-[#F97316] transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuspendModal && (
        <SuspendModal
          onClose={() => setShowSuspendModal(false)}
          onConfirm={(reason) => doStatusChange("SUSPENDED", reason)}
          isLoading={vendorsActionLoading}
        />
      )}
    </>
  );
}

// ─── Stepper bar ──────────────────────────────────────────────────────────────

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold text-[#F97316]">
        Section {step === 1 ? "one" : "two"}
      </p>
      <div className="flex gap-2">
        <div className="h-1.5 flex-1 max-w-[130px] rounded-full bg-[#F97316]" />
        <div
          className={cn(
            "h-1.5 flex-1 max-w-[130px] rounded-full transition-all",
            step === 2 ? "bg-[#F97316]" : "bg-gray-200",
          )}
        />
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
  const [bn, setBn] = useState(
    vendor.profile?.businessName || vendor.businessName || "",
  );
  const [fn, setFn] = useState(vendor.firstName ?? "");
  const [ln, setLn] = useState(vendor.lastName ?? "");
  const [email, setEmail] = useState(vendor.email ?? "");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState(
    (vendor.phone || vendor.phoneNumber || "").replace(/^\+\d{1,3}/, ""),
  );
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
      // toast already fired inside editVendor
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Edit Vendor</h1>
        </div>

        <div className="w-full rounded-xl border bg-card p-6">
          <StepBar step={step} />

          {step === 1 && (
            <>
              <h2 className="mb-5 text-xl font-semibold text-foreground">
                Business Details
              </h2>
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
              <h2 className="mb-5 text-xl font-semibold text-foreground">
                Contact Person
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={fn}
                    onChange={(e) => setFn(e.target.value)}
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={ln}
                    onChange={(e) => setLn(e.target.value)}
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">
                        * {emailErr}
                      </span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailErr) setEmailErr("");
                    }}
                    onBlur={validateEmail}
                    className={cn(
                      "h-11 rounded-lg focus-visible:ring-[#F97316]",
                      emailErr
                        ? "border-red-500 focus-visible:ring-red-400"
                        : "border-gray-300",
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <PhoneField
                    phone={phone}
                    setPhone={setPhone}
                    cc={cc}
                    setCc={setCc}
                  />
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
              className={cn(
                "h-11 px-7 gap-2 rounded-xl font-semibold",
                s1ok
                  ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
              )}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconArrowLeft className="size-4" /> Back
              </button>
              <Button
                onClick={handleSave}
                disabled={!s2ok || vendorsActionLoading}
                className={cn(
                  "h-11 px-7 gap-2 rounded-xl font-semibold",
                  s2ok && !vendorsActionLoading
                    ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                    : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
                )}
              >
                {vendorsActionLoading ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  <>
                    Save Changes <IconCheck className="size-4" />
                  </>
                )}
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
      // toast already fired inside addVendor
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Create Vendor</h1>
        </div>

        <div className="w-full rounded-xl border bg-card p-6">
          <StepBar step={step} />

          {step === 1 && (
            <>
              <h2 className="mb-5 text-xl font-semibold">Business Details</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
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
              <h2 className="mb-5 text-xl font-semibold">Contact Person</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={fn}
                    onChange={(e) => setFn(e.target.value)}
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={ln}
                    onChange={(e) => setLn(e.target.value)}
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">
                        * {emailErr}
                      </span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailErr) setEmailErr("");
                    }}
                    onBlur={validateEmail}
                    className={cn(
                      "h-11 rounded-lg focus-visible:ring-[#F97316]",
                      emailErr
                        ? "border-red-500 focus-visible:ring-red-400"
                        : "border-gray-300",
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Phone{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <PhoneField
                    phone={phone}
                    setPhone={setPhone}
                    cc={cc}
                    setCc={setCc}
                  />
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
              className={cn(
                "h-11 px-7 gap-2 rounded-xl font-semibold",
                s1ok
                  ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
              )}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={submit}
              disabled={!s2ok || vendorsActionLoading}
              className={cn(
                "h-11 px-7 gap-2 rounded-xl font-semibold",
                s2ok && !vendorsActionLoading
                  ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
              )}
            >
              {vendorsActionLoading ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                <>
                  Invite Vendor <IconSend className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function TelescopeIllustration() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 h-62 w-62 border rounded-full bg-[#EFEFEF]">
      <img
        src="/emptystate.png"
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ─── Email sent screen ────────────────────────────────────────────────────────

function EmailSentScreen({ email, onOk }: { email: string; onOk: () => void }) {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[480px] rounded-2xl border bg-[#fef8f0] px-12 py-10 text-center flex flex-col items-center">
          <EnvelopeIllustration />
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

function VendorsListPage({
  onCreateVendor,
  onEdit,
  showEditSuccessBanner,
  onDismissEditBanner,
}: {
  onCreateVendor: () => void;
  onEdit: (vendor: Vendor) => void;
  showEditSuccessBanner?: boolean;
  onDismissEditBanner?: () => void;
}) {
  const { vendors, vendorsLoading, vendorsTotal, loadVendors, resendInvite } =
    useReduxAdmin();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  // Debounce search by 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch whenever page or search changes
  useEffect(() => {
    loadVendors({
      page: currentPage,
      limit: PAGE_SIZE,
      search: search || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]);

  const activeCount = vendors.filter((v) => v.status === "ACTIVE").length;
  const pendingCount = vendors.filter((v) => v.status === "PENDING").length;
  const totalRevenue = vendors.reduce((sum, v) => sum + (v.revenue ?? 0), 0);

  const handleStatusChanged = (
    vendorName: string,
    newStatus: DisplayStatus,
  ) => {
    setSelectedVendor(null);
    setBanner(
      newStatus === "Suspended"
        ? {
            message: "Vendor account has been suspended",
            subtitle: `The reason for suspending "${vendorName}" has been sent to their email`,
          }
        : {
            message: "Vendor account has been activated",
            subtitle: `"${vendorName}" can now access the platform`,
          },
    );
    loadVendors({
      page: currentPage,
      limit: PAGE_SIZE,
      search: search || undefined,
    });
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<Vendor>[] = [
    {
      id: "contactPerson",
      accessorFn: (v) => getContactName(v),
      header: "Contact Person",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {getContactName(row.original)}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "businessName",
      accessorFn: (v) => getBusinessName(v),
      header: "Business Name",
      cell: ({ row }) => (
        <span className="text-foreground">{getBusinessName(row.original)}</span>
      ),
    },
    {
      id: "dateJoined",
      accessorFn: (v) => getDateJoined(v),
      header: "Date Joined",
      cell: ({ row }) => (
        <span className="text-foreground">{getDateJoined(row.original)}</span>
      ),
    },
    {
      id: "status",
      accessorFn: (v) => v.status,
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={toDisplayStatus(row.original.status)} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ViewAction onClick={() => setSelectedVendor(row.original)} />
      ),
    },
  ];

  const stats = [
    {
      title: "Total Vendors",
      value: vendorsTotal || 0,
      icon: <IconUsers className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active Vendors",
      value: activeCount,
      icon: (
        <svg
          className="size-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Pending Activation",
      value: pendingCount,
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
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

        {/* Edit-success banner */}
        {showEditSuccessBanner && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
            <svg
              className="size-5 shrink-0 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-5" />
            </svg>
            <p className="flex-1 text-sm font-semibold text-green-800">
              Vendor details have been updated successfully
            </p>
            <button
              onClick={onDismissEditBanner}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* Status-action banner */}
        {banner && (
          <VendorActionBanner
            message={banner.message}
            subtitle={banner.subtitle}
            onDismiss={() => setBanner(null)}
          />
        )}

        {/* ── DataTable ── */}
        <div className="rounded-xl">
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
            searchPlaceholder="Search vendors…"
            showFilters
            showSort
            sortLabel="Date Joined"
            showSelection
            showPagination
            pageSize={PAGE_SIZE}
            total={vendorsTotal}
            page={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            emptyState={
              <div className="flex flex-col items-center gap-3 py-8">
                <TelescopeIllustration />
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {debouncedSearch
                    ? "No marketers match your search"
                    : "No marketers yet!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? "Try a different term or clear the search"
                    : "No list of marketers found here"}
                </p>
              </div>
            }
          />
        </div>
      </div>

      {/* Vendor drawer */}
      {selectedVendor && (
        <VendorDrawer
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onStatusChanged={handleStatusChanged}
          onResendOtp={(id) => resendInvite(id)}
          onEdit={onEdit}
        />
      )}
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "create" | "success" | "edit" | "edit-success";

export default function VendorsPage() {
  const [view, setView] = useState<View>("list");
  const [successEmail, setSuccessEmail] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

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

  if (view === "create")
    return (
      <CreateVendorForm
        onClose={() => setView("list")}
        onSuccess={handleCreateSuccess}
      />
    );

  if (view === "success")
    return (
      <EmailSentScreen email={successEmail} onOk={() => setView("list")} />
    );

  if (view === "edit" && editingVendor)
    return (
      <EditVendorForm
        vendor={editingVendor}
        onClose={() => setView("list")}
        onSaved={handleEditSaved}
      />
    );

  return (
    <VendorsListPage
      onCreateVendor={() => setView("create")}
      onEdit={handleEdit}
      showEditSuccessBanner={view === "edit-success"}
      onDismissEditBanner={() => setView("list")}
    />
  );
}
