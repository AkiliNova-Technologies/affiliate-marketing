// app/admin/user-management/vendors/page.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  IconSearch,
  IconFilter,
  IconSortDescending,
  IconEye,
  IconPlus,
  IconArrowLeft,
  IconSend,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
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
} from "@tabler/icons-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ──────────────────────────────────────────────────────────────────────────────────────────

type VendorStatus =
  | "Active"
  | "Pending activation"
  | "Suspended"
  | "Deactivated"
  | "Deleted";

interface Vendor {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  businessName: string;
  dateJoined: string;
  status: VendorStatus;
  netRevenue: number;
  revenueChange: number;
}

// ─── Mock data ───────────────────────────────────────────────────────────────────────────────────────

const INITIAL_VENDORS: Vendor[] = [
  {
    id: "1",
    contactName: "Victor Wandulu",
    email: "wandulu@tekjuice.co.uk",
    phone: "076407857",
    businessName: "World of Afrika",
    dateJoined: "16/02/2026",
    status: "Active",
    netRevenue: 6789,
    revenueChange: 12,
  },
  {
    id: "2",
    contactName: "Labella Wilson",
    email: "wilson@gmail.com",
    phone: "076407857",
    businessName: "Social Gems",
    dateJoined: "17/03/2026",
    status: "Pending activation",
    netRevenue: 6789,
    revenueChange: 12,
  },
  {
    id: "3",
    contactName: "Asiimwe Godwin",
    email: "ass345@gmail.com",
    phone: "077345678",
    businessName: "Africa Connect",
    dateJoined: "18/04/2026",
    status: "Suspended",
    netRevenue: 3200,
    revenueChange: -3,
  },
  {
    id: "4",
    contactName: "Innocent Ademon",
    email: "innde@gmail.com",
    phone: "075123456",
    businessName: "Everything Uganda",
    dateJoined: "19/05/2026",
    status: "Deactivated",
    netRevenue: 1450,
    revenueChange: 0,
  },
  {
    id: "5",
    contactName: "Muthoni Angella",
    email: "mutngella@gmail.com",
    phone: "078234567",
    businessName: "Task Reporting System",
    dateJoined: "20/06/2026",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
  {
    id: "6",
    contactName: "Webina Lawson",
    email: "webson@gmail.com",
    phone: "074345678",
    businessName: "Colaw",
    dateJoined: "15/02/2026",
    status: "Pending activation",
    netRevenue: 2100,
    revenueChange: 5,
  },
  {
    id: "7",
    contactName: "Khalid Aucho",
    email: "Khalaucho@convey.com",
    phone: "073456789",
    businessName: "Arrow Conveyancing",
    dateJoined: "14/02/2026",
    status: "Active",
    netRevenue: 8900,
    revenueChange: 20,
  },
  {
    id: "8",
    contactName: "Quincy Maine",
    email: "Qmaine@gmail.com",
    phone: "072567890",
    businessName: "Horus",
    dateJoined: "13/02/2026",
    status: "Suspended",
    netRevenue: 4300,
    revenueChange: -8,
  },
  {
    id: "9",
    contactName: "Yvette Mandela",
    email: "yvetteman@gmail.com",
    phone: "071678901",
    businessName: "Gem Pay",
    dateJoined: "12/02/2026",
    status: "Deactivated",
    netRevenue: 990,
    revenueChange: 0,
  },
  {
    id: "10",
    contactName: "Mulutta Peter",
    email: "mulutta1918@gmail.com",
    phone: "070789012",
    businessName: "Kampala Nights",
    dateJoined: "11/02/2026",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
];

// ─── Status badge ────────────────────────────────────────────────────────────────────────────────────

function VendorStatusBadge({ status }: { status: VendorStatus }) {
  const s: Record<VendorStatus, string> = {
    Active: "border border-green-500 text-green-700 bg-green-50",
    "Pending activation": "border border-amber-400 text-amber-700 bg-amber-50",
    Suspended: "border-2 border-gray-800 text-gray-800 bg-white font-semibold",
    Deactivated: "border border-gray-300 text-gray-400 bg-gray-50",
    Deleted: "text-red-500 bg-transparent border-none",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
        s[status],
      )}
    >
      {status}
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────────────────────────────

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

// ─── Illustrations ────────────────────────────────────────────────────────────────────────────────────

function TelescopeIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto w-52 h-52" fill="none">
      <circle cx="100" cy="100" r="82" fill="#f3f4f6" />
      <g transform="rotate(-30, 100, 110)">
        <rect x="55" y="100" width="72" height="22" rx="7" fill="#1a1a1a" />
        <rect x="48" y="96" width="24" height="18" rx="4" fill="#333" />
        <rect x="123" y="104" width="10" height="10" rx="2" fill="#555" />
      </g>
      <line
        x1="100"
        y1="138"
        x2="72"
        y2="178"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="138"
        x2="128"
        y2="178"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="138"
        x2="100"
        y2="178"
        stroke="#1a1a1a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="70" cy="65" r="24" fill="#1a1a1a" />
      <text
        x="63"
        y="74"
        fontSize="24"
        fill="white"
        fontFamily="serif"
        fontWeight="bold"
      >
        ?
      </text>
      <circle cx="148" cy="55" r="3" fill="#1a1a1a" />
      <circle cx="160" cy="76" r="2.2" fill="#1a1a1a" />
      <circle cx="136" cy="70" r="1.8" fill="#1a1a1a" />
    </svg>
  );
}

function EnvelopeIllustration() {
  return (
    <svg viewBox="0 0 180 140" className="mx-auto w-44 h-36" fill="none">
      <rect
        x="15"
        y="42"
        width="135"
        height="82"
        rx="7"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <path
        d="M15 42 L82 88 L149 42"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <rect x="40" y="56" width="82" height="52" rx="3" fill="#fef3e2" />
      <line
        x1="52"
        y1="70"
        x2="110"
        y2="70"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="80"
        x2="110"
        y2="80"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="90"
        x2="88"
        y2="90"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="81" cy="107" r="4.5" fill="#e5e7eb" />
      <rect
        x="60"
        y="5"
        width="9"
        height="42"
        rx="4.5"
        fill="#1a1a1a"
        transform="rotate(15,64,26)"
      />
      <polygon
        points="64,46 58,56 70,56"
        fill="#1a1a1a"
        transform="rotate(15,64,51)"
      />
      <rect x="14" y="108" width="62" height="12" rx="6" fill="#1a1a1a" />
    </svg>
  );
}

function CompanyLogo() {
  return (
    <div>
      <img src="/company-logo-placeholder.png" alt="Company Logo" />
    </div>
  );
}

// ─── Suspension Banner ────────────────────────────────────────────────────────────────────────────────

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

// ─── Suspend Confirm Modal ────────────────────────────────────────────────────────────────────────────

function SuspendModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: (r: string) => void;
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
                <svg
                  className="size-4 animate-spin"
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
                Suspending…
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

// ─── Vendor Drawer ────────────────────────────────────────────────────────────────────────────────────

const STATUS_ACTIONS: Record<
  VendorStatus,
  Array<{ label: string; action: VendorStatus; danger?: boolean }>
> = {
  Active: [{ label: "Suspend", action: "Suspended", danger: true }],
  "Pending activation": [
    { label: "Activate", action: "Active" },
    { label: "Suspend", action: "Suspended", danger: true },
  ],
  Suspended: [{ label: "Activate", action: "Active" }],
  Deactivated: [{ label: "Activate", action: "Active" }],
  Deleted: [],
};

function VendorDrawer({
  vendor,
  onClose,
  onStatusChange,
  onResendOtp,
  onEdit,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onStatusChange: (id: string, s: VendorStatus, reason?: string) => void;
  onResendOtp?: (id: string) => void;
  onEdit?: (vendor: Vendor) => void;
}) {
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);

  if (!vendor) return null;
  const actions = STATUS_ACTIONS[vendor.status] ?? [];
  const showOtp =
    vendor.status === "Pending activation" || vendor.status === "Active";

  const handleAction = (action: string) => {
    if (action === "Suspended") setShowSuspendModal(true);
    else {
      onStatusChange(vendor.id, action as VendorStatus);
      onClose();
    }
  };

  const handleSuspend = async (reason: string) => {
    setIsSuspending(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSuspending(false);
    setShowSuspendModal(false);
    onStatusChange(vendor.id, "Suspended", reason);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Dialog panel — centered, matching the designs */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-full border border-gray-200 size-8 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <IconX className="size-4" />
          </button>

          <div className="p-8 pt-16 pb-16 max-h-[90vh] overflow-y-auto">
            {/* Header section with logo and company info */}
            <div className="flex gap-6 mb-6">
              {/* Logo */}
              <div className="shrink-0 size-[140px] rounded-xl border border-gray-200 bg-white overflow-hidden">
                <CompanyLogo />
              </div>

              {/* Company info and actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {vendor.businessName}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-[#F97316]">
                      Joined {vendor.dateJoined}
                    </p>
                  </div>
                  <button className="shrink-0 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-[#F97316] hover:text-[#F97316] transition-colors">
                    View details <IconEye className="size-3.5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Info grid - 2 columns for better layout */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-3 mb-4">
                  {[
                    {
                      Icon: IconUser,
                      label: "Contact Person",
                      value: vendor.contactName,
                    },
                    {
                      Icon: IconPhone,
                      label: "Phone number",
                      value: vendor.phone,
                    },
                    {
                      Icon: IconMail,
                      label: "Email Address",
                      value: vendor.email,
                    },
                    {
                      Icon: IconCircleDashed,
                      label: "Status",
                      value: <VendorStatusBadge status={vendor.status} />,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex grid grid-cols-2 items-start gap-2.5"
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

                {/* Net Revenue card */}
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
                      $ {vendor.netRevenue.toLocaleString()}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-semibold",
                        vendor.revenueChange >= 0
                          ? "text-green-600"
                          : "text-red-500",
                      )}
                    >
                      <IconTrendingUp className="size-4" />
                      <span>
                        {vendor.revenueChange >= 0 ? "+" : ""}
                        {vendor.revenueChange}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      onEdit?.(vendor);
                      onClose();
                    }}
                    className="h-10 gap-2 rounded-md bg-[#F97316] px-5 text-sm font-semibold text-white hover:bg-[#F97316]/90"
                  >
                    Edit <IconEdit className="size-4" />
                  </Button>

                  {actions.length > 0 && (
                    <Select onValueChange={handleAction}>
                      <SelectTrigger className="w-[160px] min-h-10 rounded-md border-gray-200 text-sm font-semibold">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((a) => (
                          <SelectItem 
                            key={a.action} 
                            value={a.action}
                            className={cn(
                              a.danger && "text-red-500 font-medium"
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
                      onClick={() => onResendOtp?.(vendor.id)}
                      className="ml-auto text-sm font-semibold underline underline-offset-2 text-foreground hover:text-[#F97316] transition-colors"
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
          onConfirm={handleSuspend}
          isLoading={isSuspending}
        />
      )}
    </>
  );
}

// ─── Edit Vendor Form ─────────────────────────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "256", label: "🇺🇬 UG" },
  { code: "254", label: "🇰🇪 KE" },
  { code: "255", label: "🇹🇿 TZ" },
  { code: "250", label: "🇷🇼 RW" },
  { code: "1", label: "🇺🇸 US" },
  { code: "44", label: "🇬🇧 GB" },
];

function EditVendorForm({
  vendor,
  onClose,
  onSaved,
}: {
  vendor: Vendor;
  onClose: () => void;
  onSaved: (updated: Vendor) => void;
}) {
  // Split contactName into first + last (best-effort)
  const nameParts = vendor.contactName.split(" ");
  const initFn = nameParts[0] ?? "";
  const initLn = nameParts.slice(1).join(" ");
  const phoneDigits = vendor.phone.replace(/^\+?\d{1,3}[-\s]?/, ""); // strip country code if present

  const [step, setStep] = useState<1 | 2>(1);
  const [bn, setBn] = useState(vendor.businessName);
  const [fn, setFn] = useState(initFn);
  const [ln, setLn] = useState(initLn);
  const [email, setEmail] = useState(vendor.email);
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState(vendor.phone);
  const [cc, setCc] = useState("256");
  const [ccOpen, setCcOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const s1ok = bn.trim().length > 0;
  const s2ok = !!(fn.trim() && ln.trim() && email.trim() && !emailErr);

  const checkEmail = () => {
    // Allow the vendor's own email without error
    if (email !== vendor.email && email === "victor@tekjuice.co.uk") {
      setEmailErr("The email you have entered already exists in the system");
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address");
    } else {
      setEmailErr("");
    }
  };

  const handleSave = async () => {
    if (!s2ok) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    onSaved({
      ...vendor,
      businessName: bn.trim(),
      contactName: `${fn.trim()} ${ln.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*64)",
          "--header-height": "calc(var(--spacing)*14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Edit Vendor</h1>
          </div>

          {/* Stepper card */}
          <div className="w-full rounded-xl border bg-card p-6">
            {/* Progress stepper */}
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

            {/* ── Step 1: Business Details ── */}
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

            {/* ── Step 2: Contact Person ── */}
            {step === 2 && (
              <>
                <h2 className="mb-5 text-xl font-semibold text-foreground">
                  Contact Person
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}
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

                  {/* Last Name */}
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

                  {/* Email */}
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
                      onBlur={checkEmail}
                      className={cn(
                        "h-11 rounded-lg focus-visible:ring-[#F97316]",
                        emailErr
                          ? "border-red-500 focus-visible:ring-red-400"
                          : "border-gray-300",
                      )}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Phone{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCcOpen((v) => !v)}
                          className="flex h-11 items-center gap-1.5 rounded-lg border border-gray-300 bg-background px-3 text-sm font-medium hover:border-[#F97316] transition-colors"
                        >
                          {cc}{" "}
                          <IconChevronDown className="size-3 text-muted-foreground" />
                        </button>
                        {ccOpen && (
                          <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded-lg border bg-card shadow-lg py-1">
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCc(c.code);
                                  setCcOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="eg 7748958996"
                        className={cn(
                          "h-11 flex-1 rounded-lg",
                          phone
                            ? "border-[#F97316] focus-visible:ring-[#F97316]"
                            : "border-gray-300 focus-visible:ring-[#F97316]",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 flex justify-end">
            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                disabled={!s1ok}
                className={cn(
                  "h-11 min-w-3xs px-7 gap-2 rounded-xl font-semibold",
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
                {/* Back button */}
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconArrowLeft className="size-4" /> Back
                </button>
                <Button
                  onClick={handleSave}
                  disabled={!s2ok || busy}
                  className={cn(
                    "h-11 min-w-3xs px-7 gap-2 rounded-xl font-semibold",
                    s2ok && !busy
                      ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                      : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
                  )}
                >
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="size-4 animate-spin"
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
                      Saving…
                    </span>
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
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Create Vendor Form ────────────────────────────────────────────────────────────────────────────────

function CreateVendorForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (e: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [bn, setBn] = useState("");
  const [fn, setFn] = useState("");
  const [ln, setLn] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [cc, setCc] = useState("256");
  const [ccOpen, setCcOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const s1ok = bn.trim().length > 0;
  const s2ok = !!(fn.trim() && ln.trim() && email.trim() && !emailErr);

  const checkEmail = () => {
    if (email === "victor@tekjuice.co.uk")
      setEmailErr("The email you have entered already exists in the system");
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      setEmailErr("Please enter a valid email address");
    else setEmailErr("");
  };

  const submit = async () => {
    if (!s2ok) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1200));
    setBusy(false);
    onSuccess(email);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*64)",
          "--header-height": "calc(var(--spacing)*14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              Create Vendor
            </h1>
          </div>
          <div className="w-full rounded-xl border bg-card p-6">
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
                      onBlur={checkEmail}
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
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCcOpen((v) => !v)}
                          className="flex h-11 items-center gap-1.5 rounded-lg border border-gray-300 bg-background px-3 text-sm font-medium hover:border-[#F97316] transition-colors"
                        >
                          {cc}{" "}
                          <IconChevronDown className="size-3 text-muted-foreground" />
                        </button>
                        {ccOpen && (
                          <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded-lg border bg-card shadow-lg py-1">
                            {COUNTRY_CODES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCc(c.code);
                                  setCcOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="eg 7748958996"
                        className={cn(
                          "h-11 flex-1 rounded-lg",
                          phone
                            ? "border-[#F97316] focus-visible:ring-[#F97316]"
                            : "border-gray-300 focus-visible:ring-[#F97316]",
                        )}
                      />
                    </div>
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
                  "h-11 min-w-3xs px-7 gap-2 rounded-xl font-semibold",
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
                disabled={!s2ok || busy}
                className={cn(
                  "h-11 min-w-3xs px-7 gap-2 rounded-xl font-semibold",
                  s2ok && !busy
                    ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                    : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
                )}
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="size-4 animate-spin"
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
                    Sending…
                  </span>
                ) : (
                  <>
                    Invite Vendor <IconSend className="size-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Email Sent Screen ─────────────────────────────────────────────────────────────────────────────────

function EmailSentScreen({ email, onOk }: { email: string; onOk: () => void }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*64)",
          "--header-height": "calc(var(--spacing)*14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-[480px] rounded-2xl border bg-[#fef8f0] px-12 py-10 text-center">
            <EnvelopeIllustration />
            <p className="mt-6 text-[15px] leading-relaxed text-foreground">
              An invitation has been sent to the vendor email{" "}
              <span className="font-bold">{email}</span>
            </p>
            <Button
              onClick={onOk}
              className="mt-7 h-11 w-24 rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333]"
            >
              OK
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Vendors List Page ─────────────────────────────────────────────────────────────────────────────────

function VendorsListPage({
  onCreateVendor,
  onEdit,
  isEmpty = false,
  initialVendors,
  showEditSuccessBanner,
  onDismissEditBanner,
}: {
  onCreateVendor: () => void;
  onEdit: (vendor: Vendor) => void;
  isEmpty?: boolean;
  initialVendors?: Vendor[];
  showEditSuccessBanner?: boolean;
  onDismissEditBanner?: () => void;
}) {
  const [vendors, setVendors] = useState<Vendor[]>(
    initialVendors ?? (isEmpty ? [] : INITIAL_VENDORS),
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage] = useState(2);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  const filtered = vendors.filter(
    (v) =>
      v.contactName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.businessName.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleStatusChange = (
    id: string,
    newStatus: VendorStatus,
    reason?: string,
  ) => {
    const vendor = vendors.find((v) => v.id === id);
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)),
    );
    if (!vendor) return;
    if (newStatus === "Suspended") {
      setBanner({
        message: "Vendor account has been suspended",
        subtitle: `The reason for suspending "${vendor.businessName}" has been sent to their email`,
      });
    } else if (newStatus === "Active") {
      setBanner({
        message: "Vendor account has been activated",
        subtitle: `"${vendor.businessName}" can now access the platform`,
      });
    }
    setSelectedVendor(null);
  };

  const stats = [
    {
      title: "Total Vendors",
      value: isEmpty ? "0" : "20,000",
      change: isEmpty ? undefined : "+15%",
      icon: <IconUsers className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active Vendors",
      value: isEmpty ? "0" : "15,000",
      change: isEmpty ? undefined : "+10%",
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
      value: isEmpty ? "0" : "2,500",
      change: isEmpty ? undefined : "+5%",
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: isEmpty ? "$0" : "$6,789",
      change: isEmpty ? undefined : "+12%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*64)",
          "--header-height": "calc(var(--spacing)*14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
          <h1 className="mb-5 text-2xl font-bold text-foreground">Vendors</h1>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* Post-edit success banner */}
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

          {/* Banner */}
          {banner && (
            <VendorActionBanner
              message={banner.message}
              subtitle={banner.subtitle}
              onDismiss={() => setBanner(null)}
            />
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-1 flex-col items-center justify-center py-16">
              <TelescopeIllustration />
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                No vendor here yet!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a new vendor by clicking on the button below
              </p>
              <Button
                onClick={onCreateVendor}
                className="mt-6 h-12 min-w-[200px] rounded-xl bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333]"
              >
                Add Vendor
              </Button>
            </div>
          )}

          {/* Table */}
          {!isEmpty && (
            <div className="rounded-xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <h3 className="font-semibold text-foreground">All Vendors</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage and monitor all vendors on the platform
                  </p>
                </div>
                <Button
                  onClick={onCreateVendor}
                  className="h-9 gap-1.5 rounded-lg bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#F97316]/90"
                >
                  <IconPlus className="size-3.5" /> Create Vendor
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
                <div className="relative w-full max-w-xs">
                  <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-9 pl-9 text-sm border-gray-200 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:border-[#F97316] transition-colors">
                    <IconFilter className="size-3.5" /> Filters
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Sort by:{" "}
                    <span className="font-medium text-[#F97316]">
                      Upload Date
                    </span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <IconSortDescending className="inline size-3.5" />
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20 text-left text-muted-foreground">
                      <th className="w-10 px-5 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 accent-[#F97316]"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Contact Person</th>
                      <th className="px-4 py-3 font-medium">Business Name</th>
                      <th className="px-4 py-3 font-medium">Date Joined</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(v.id)}
                            onChange={() => toggleSelect(v.id)}
                            className="rounded border-gray-300 accent-[#F97316]"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">
                            {v.contactName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.email}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-foreground">
                          {v.businessName}
                        </td>
                        <td className="px-4 py-3.5 text-foreground">
                          {v.dateJoined}
                        </td>
                        <td className="px-4 py-3.5">
                          <VendorStatusBadge status={v.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          {/* ── clicking View opens the drawer ── */}
                          <button
                            onClick={() => setSelectedVendor(v)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <IconEye className="size-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <IconChevronLeft className="size-3.5" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      className={cn(
                        "flex size-7 items-center justify-center rounded text-xs font-medium transition-colors",
                        p === currentPage
                          ? "bg-[#F97316] text-white"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <span className="px-1 text-xs text-muted-foreground">…</span>
                  <button className="flex size-7 items-center justify-center rounded text-xs text-muted-foreground hover:text-foreground">
                    10
                  </button>
                </div>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Next <IconChevronRight className="size-3.5" />
                </button>
              </div>
              <p className="px-5 pb-3 text-right text-xs text-muted-foreground">
                Showing 11 - 20 of 128
              </p>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* VendorDrawer renders fixed/absolute above everything */}
      {selectedVendor && (
        <VendorDrawer
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onStatusChange={handleStatusChange}
          onResendOtp={(id) => console.log("Resend OTP:", id)}
          onEdit={onEdit}
        />
      )}
    </SidebarProvider>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────────────────────────────

type View =
  | "list"
  | "list-empty"
  | "create"
  | "success"
  | "edit"
  | "edit-success";
const INITIAL_VIEW: View = "list";

export default function VendorsPage() {
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [successEmail, setSuccessEmail] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);

  const handleCreateSuccess = useCallback((email: string) => {
    setSuccessEmail(email);
    setView("success");
  }, []);

  const handleEdit = useCallback((vendor: Vendor) => {
    setEditingVendor(vendor);
    setView("edit");
  }, []);

  const handleEditSaved = useCallback((updated: Vendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
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
  if (view === "list-empty")
    return (
      <VendorsListPage
        isEmpty
        onCreateVendor={() => setView("create")}
        onEdit={handleEdit}
      />
    );
  return (
    <VendorsListPage
      onCreateVendor={() => setView("create")}
      onEdit={handleEdit}
      initialVendors={vendors}
      showEditSuccessBanner={view === "edit-success"}
      onDismissEditBanner={() => setView("list")}
    />
  );
}
