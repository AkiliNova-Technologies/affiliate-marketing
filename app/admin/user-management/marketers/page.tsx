// app/admin/user-management/marketers/page.tsx
//
// Covers all 7 designs:
//   Image 6 — Marketers list (populated)
//   Image 7 — Empty state (no marketers)
//   Image 1 — List + "Suspended" action banner
//   Image 2 — List + "Deactivated" action banner
//   Image 5 — Quick-view modal (dropdown closed)
//   Image 4 — Quick-view modal (dropdown open → Deactivate + Suspend)
//   Image 3 — Marketer Details full page with campaigns grid

"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconX,
  IconArrowLeft,
  IconAlertCircle,
  IconBan,
  IconCircleDashed,
  IconPhone,
  IconMail,
  IconCurrencyDollar,
  IconTrendingUp,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ──────────────────────────────────────────────────────────────────

type MarketerStatus = "Active" | "Suspended" | "Deactivated" | "Deleted";

interface Marketer {
  id: string;
  name: string;
  email: string;
  nickname: string;
  phone: string;
  status: MarketerStatus;
  netRevenue: number;
  revenueChange: number;
}

interface Campaign {
  id: string;
  title: string;
  vendor: string;
  image: string;
  status: "Active" | "Paused";
  totalClicks: string;
  conversionRate: string;
  totalSales: string;
  link: string;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const INITIAL_MARKETERS: Marketer[] = [
  {
    id: "1",
    name: "Victor Wandulu",
    email: "wandulu@tekjuice.co.uk",
    nickname: "VanVictor",
    phone: "+256 76407857",
    status: "Active",
    netRevenue: 6789,
    revenueChange: 12,
  },
  {
    id: "2",
    name: "Labella Wilson",
    email: "wilson@gmail.com",
    nickname: "Lab-Ella",
    phone: "+256 66407857",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
  {
    id: "3",
    name: "Asiimwe Godwin",
    email: "ass345@gmail",
    nickname: "Gogo256",
    phone: "+256 78407857",
    status: "Suspended",
    netRevenue: 3200,
    revenueChange: -3,
  },
  {
    id: "4",
    name: "Innocent Ademon",
    email: "innde@gmail.com",
    nickname: "Innocentson",
    phone: "+256 77407857",
    status: "Deactivated",
    netRevenue: 1450,
    revenueChange: 0,
  },
  {
    id: "5",
    name: "Muthoni Angella",
    email: "mutngella@gmail.com",
    nickname: "Muthobaby",
    phone: "+256 66407857",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
  {
    id: "6",
    name: "Webina Lawson",
    email: "webson@gmail.com",
    nickname: "TheLaw",
    phone: "+256 766407857",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
  {
    id: "7",
    name: "Khalid Aucho",
    email: "Khalaucho@convey.com",
    nickname: "MeKhalid",
    phone: "+256 766407857",
    status: "Active",
    netRevenue: 8900,
    revenueChange: 20,
  },
  {
    id: "8",
    name: "Quincy Maine",
    email: "Qmaine@gmail.com",
    nickname: "Quincyman",
    phone: "+200 766407857",
    status: "Suspended",
    netRevenue: 4300,
    revenueChange: -8,
  },
  {
    id: "9",
    name: "Yvette Mandela",
    email: "yvetteman@gmail.com",
    nickname: "Yvevy",
    phone: "+1 776407857",
    status: "Deactivated",
    netRevenue: 990,
    revenueChange: 0,
  },
  {
    id: "10",
    name: "Mulutta Peter",
    email: "mulutta1918@gmail.com",
    nickname: "RevPeter",
    phone: "+254 766407857",
    status: "Deleted",
    netRevenue: 0,
    revenueChange: 0,
  },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    title: "24Hr Wedding Photography",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop",
    status: "Paused",
    totalClicks: "4,000",
    conversionRate: "89%",
    totalSales: "34,000",
    link: "htp/studio/blogdata-report-design/",
  },
  {
    id: "2",
    title: "Safe jaj app",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    status: "Active",
    totalClicks: "20,000",
    conversionRate: "89%",
    totalSales: "16,000",
    link: "htp/studio/blogdata-report-design/",
  },
  {
    id: "3",
    title: "Betrayed by my leader",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=250&fit=crop",
    status: "Active",
    totalClicks: "100K",
    conversionRate: "59%",
    totalSales: "59,000",
    link: "htp/studio/blogdata-report-design/",
  },
  {
    id: "4",
    title: "24Hr Wedding Photography",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop",
    status: "Paused",
    totalClicks: "4,000",
    conversionRate: "89%",
    totalSales: "34,000",
    link: "htp/studio/blogdata-report-design/",
  },
  {
    id: "5",
    title: "Safe jaj app",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    status: "Active",
    totalClicks: "20,000",
    conversionRate: "89%",
    totalSales: "16,000",
    link: "htp/studio/blogdata-report-design/",
  },
  {
    id: "6",
    title: "Betrayed by my leader",
    vendor: "Everything Uganda",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=250&fit=crop",
    status: "Active",
    totalClicks: "100K",
    conversionRate: "59%",
    totalSales: "59,000",
    link: "htp/studio/blogdata-report-design/",
  },
];

// ─── Sidebar provider wrapper ────────────────────────────────────────────────

const SIDEBAR_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 64)",
  "--header-height": "calc(var(--spacing) * 14)",
} as React.CSSProperties;

// ─── Status badge ────────────────────────────────────────────────────────────

function MarketerStatusBadge({ status }: { status: MarketerStatus }) {
  const styles: Record<MarketerStatus, string> = {
    Active: "border border-green-500 text-green-700 bg-green-50",
    Suspended: "border-2 border-gray-800 text-gray-800 bg-white font-semibold",
    Deactivated: "border border-gray-300 text-gray-400 bg-gray-50",
    Deleted: "text-red-500 border border-red-200 bg-red-50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

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

// ─── Telescope illustration ───────────────────────────────────────────────────

function TelescopeIllustration() {
  return (
    <svg viewBox="0 0 240 220" className="mx-auto w-60 h-56" fill="none">
      {/* Background circle */}
      <circle cx="120" cy="110" r="95" fill="#f0f0f0" />
      {/* Telescope body */}
      <rect
        x="60"
        y="105"
        width="90"
        height="22"
        rx="7"
        fill="#1a1a1a"
        transform="rotate(-15,105,116)"
      />
      {/* Eyepiece */}
      <rect
        x="52"
        y="100"
        width="28"
        height="18"
        rx="5"
        fill="#333"
        transform="rotate(-15,66,109)"
      />
      {/* Lens end */}
      <circle
        cx="158"
        cy="95"
        r="11"
        fill="#555"
        transform="rotate(-15,158,95)"
      />
      {/* Tripod legs */}
      <line
        x1="118"
        y1="132"
        x2="88"
        y2="185"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="118"
        y1="132"
        x2="148"
        y2="185"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="118"
        y1="132"
        x2="118"
        y2="185"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Base line */}
      <line
        x1="78"
        y1="185"
        x2="158"
        y2="185"
        stroke="#1a1a1a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Question mark ball */}
      <circle cx="82" cy="72" r="26" fill="#1a1a1a" />
      <text
        x="73"
        y="82"
        fontSize="26"
        fill="white"
        fontFamily="Georgia, serif"
        fontWeight="bold"
      >
        ?
      </text>
      {/* Stars */}
      <text x="165" y="55" fontSize="14" fill="#1a1a1a">
        +
      </text>
      <text x="180" y="80" fontSize="11" fill="#1a1a1a">
        +
      </text>
      <text x="152" y="75" fontSize="9" fill="#1a1a1a">
        +
      </text>
    </svg>
  );
}

// ─── Avatar initials badge ────────────────────────────────────────────────────

function AvatarInitials({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "size-10 text-sm",
    md: "size-16 text-xl",
    lg: "size-20 text-2xl",
    xl: "size-32 text-3xl",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-gray-200 bg-white font-bold text-gray-700",
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}

// ─── Action status options by current status ─────────────────────────────────

const STATUS_ACTIONS: Record<
  MarketerStatus,
  Array<{ label: string; action: MarketerStatus; danger?: boolean }>
> = {
  Active: [
    { label: "Deactivate", action: "Deactivated" },
    { label: "Suspend", action: "Suspended", danger: true },
  ],
  Suspended: [
    { label: "Activate", action: "Active" },
    { label: "Deactivate", action: "Deactivated" },
  ],
  Deactivated: [
    { label: "Activate", action: "Active" },
    { label: "Suspend", action: "Suspended", danger: true },
  ],
  Deleted: [],
};

// ─── Quick-view Modal ─────────────────────────────────────────────────────────

interface MarketerModalProps {
  marketer: Marketer;
  onClose: () => void;
  onStatusChange: (id: string, status: MarketerStatus) => void;
  onViewDetails: (marketer: Marketer) => void;
}

function MarketerModal({
  marketer,
  onClose,
  onStatusChange,
  onViewDetails,
}: MarketerModalProps) {
  const actions = STATUS_ACTIONS[marketer.status] ?? [];

  const handleAction = (action: string) => {
    onStatusChange(marketer.id, action as MarketerStatus);
    onClose();
  };

  // Green check badge on avatar — shown when Active
  const isActive = marketer.status === "Active";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-full border border-gray-200 size-8 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <IconX className="size-4" />
          </button>

          <div className="p-8 pt-16 max-h-[90vh] overflow-y-auto">
            {/* Header section with avatar and info */}
            <div className="flex gap-8 mb-6">
              {/* Avatar with green check */}
              <div className="relative shrink-0 h-32 w-32">
                <AvatarInitials name={marketer.name} size="xl" />
                {isActive && (
                  <div className="absolute bottom-2.5 right-1 flex items-center justify-center size-6 rounded-full bg-green-500 border-2 border-white">
                    <IconCheck className="size-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info and actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {marketer.name}
                    </h2>
                    <p className="text-sm font-medium text-[#F97316] mt-0.5">
                      {marketer.nickname}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onViewDetails(marketer);
                    }}
                    className="shrink-0 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-[#F97316] hover:text-[#F97316] transition-colors"
                  >
                    View details <IconEye className="size-3.5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Info grid - 2 columns */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-3 mb-8">
                  {[
                    {
                      Icon: IconCircleDashed,
                      label: "Status",
                      value: <MarketerStatusBadge status={marketer.status} />,
                    },
                    {
                      Icon: IconPhone,
                      label: "Phone number",
                      value: marketer.phone,
                    },
                    {
                      Icon: IconMail,
                      label: "Email Address",
                      value: marketer.email,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex grid grid-cols-2 items-start gap-2.5"
                    >
                      <div className="flex items-center gap-2">
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
                      $ {marketer.netRevenue.toLocaleString()}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-semibold",
                        marketer.revenueChange >= 0
                          ? "text-green-600"
                          : "text-red-500",
                      )}
                    >
                      <IconTrendingUp className="size-4" />
                      <span>
                        {marketer.revenueChange >= 0 ? "+" : ""}
                        {marketer.revenueChange}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Status dropdown - Using shadcn Select */}
                {actions.length > 0 && (
                  <Select onValueChange={handleAction}>
                    <SelectTrigger className="w-full min-h-11 rounded-md border-gray-200 text-sm font-semibold">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Action Banner ────────────────────────────────────────────────────────────

function MarketerActionBanner({
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

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(campaign.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border bg-[#F7F7F7] overflow-hidden">
      {/* Image + status badge */}
      <div className="relative h-[160px] bg-gray-100 overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <span
          className={cn(
            "absolute top-3 right-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            campaign.status === "Active"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-amber-100 text-amber-700 border border-amber-200",
          )}
        >
          {campaign.status}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-foreground text-sm leading-snug">
          {campaign.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          By {campaign.vendor}
        </p>

        {/* Stats row */}
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-50 pt-3 bg-white rounded-lg p-3 px-6">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Clicks</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.totalClicks}
            </p>
          </div>
          <div className="min-h-[30px] w-[2px] bg-[#F7F7F7] border"/>
          <div>
            <p className="text-[10px] text-muted-foreground">Conversion rate</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.conversionRate}
            </p>
          </div>
          <div className="min-h-[30px] w-[2px] bg-[#F7F7F7] border"/>

          <div>
            <p className="text-[10px] text-muted-foreground">Total Sales</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.totalSales}
            </p>
          </div>
        </div>

        {/* Link row */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <p className="flex-1 min-w-0 truncate text-xs text-muted-foreground">
            {campaign.link}
          </p>
          <button
            onClick={handleCopy}
            className="shrink-0 text-gray-400 hover:text-[#F97316] transition-colors"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-green-500" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Marketer Details Page ────────────────────────────────────────────────────

function MarketerDetailsPage({
  marketer,
  onBack,
}: {
  marketer: Marketer;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CAMPAIGNS.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.vendor.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SidebarProvider style={SIDEBAR_STYLE}>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
          {/* Page title */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              Marketer Details
            </h1>
          </div>

          {/* Profile card */}
          <div className="mb-6 rounded-xl border bg-white p-6 ">
            <div className="flex items-start gap-5 mb-5">
              {/* Avatar with green check */}
              <div className="relative shrink-0">
                <AvatarInitials name={marketer.name} size="lg" />
                {marketer.status === "Active" && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-6 rounded-full bg-green-500 border-2 border-white">
                    <IconCheck
                      className="size-3.5 text-white"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {marketer.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {marketer.nickname}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 mb-4" />

            {/* Info + Revenue side by side */}
            <div className="flex gap-6 flex-wrap">
              {/* Info rows */}
              <div className="flex-1 min-w-[260px] divide-y divide-gray-50">
                {[
                  {
                    Icon: IconCircleDashed,
                    label: "Status",
                    value: <MarketerStatusBadge status={marketer.status} />,
                  },
                  {
                    Icon: IconPhone,
                    label: "Phone number",
                    value: marketer.phone,
                  },
                  {
                    Icon: IconMail,
                    label: "Email Address",
                    value: marketer.email,
                  },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground min-w-[140px]">
                      <Icon className="size-4 shrink-0 text-gray-400" />
                      <span>{label}</span>
                    </div>
                    <div className="text-sm text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              {/* Net Revenue card */}
              <div className="w-[260px] rounded-xl border border-gray-100 bg-gray-50/60 p-4 self-start">
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
                    $ {marketer.netRevenue.toLocaleString()}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold",
                      marketer.revenueChange >= 0
                        ? "text-green-600"
                        : "text-red-500",
                    )}
                  >
                    <IconTrendingUp className="size-4" />
                    <span>
                      {marketer.revenueChange >= 0 ? "+" : ""}
                      {marketer.revenueChange}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns section */}
          <div className="p-6 rounded-xl bg-[#FFFFFF]">
            <h3 className="text-lg font-bold text-foreground">
              {marketer.name.split(" ")[0]}'s campaigns
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              List of products that marketer has generated links for.
            </p>

            {/* Search + filters */}
            <div className="mt-4 mb-5 flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs">
                <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="h-10 pl-9 text-sm border-gray-200 focus-visible:ring-[#F97316]"
                />
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:border-[#F97316] transition-colors">
                  <IconFilter className="size-3.5" /> Filters
                </button>
                <span className="text-xs text-muted-foreground">
                  Sort by:{" "}
                  <span className="font-medium text-[#F97316]">Ascending</span>
                  <span className="mx-1.5 text-gray-300">|</span>
                  <IconSortAscending className="inline size-3.5" />
                </span>
              </div>
            </div>

            {/* Campaigns grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Marketers List Page ──────────────────────────────────────────────────────

interface ListPageProps {
  marketers: Marketer[];
  isEmpty?: boolean;
  banner: { message: string; subtitle: string } | null;
  onDismissBanner: () => void;
  onView: (marketer: Marketer) => void;
  onViewDetails: (marketer: Marketer) => void;
  onStatusChange: (id: string, status: MarketerStatus) => void;
}

function MarketersListPage({
  marketers,
  isEmpty,
  banner,
  onDismissBanner,
  onView,
  onViewDetails,
  onStatusChange,
}: ListPageProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage] = useState(2);
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(
    null,
  );

  const filtered = marketers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.nickname.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const stats = [
    {
      title: "Total Marketers",
      value: isEmpty ? "0" : "2,000",
      change: isEmpty ? undefined : "+15%",
      icon: (
        <svg
          className="size-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active marketors",
      value: isEmpty ? "0" : "40",
      change: isEmpty ? undefined : "+5%",
      icon: (
        <svg
          className="size-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Suspended",
      value: isEmpty ? "0" : "40",
      change: isEmpty ? undefined : "+5%",
      icon: (
        <svg
          className="size-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: isEmpty ? "$0" : "$40,000",
      change: isEmpty ? undefined : "+5%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <SidebarProvider style={SIDEBAR_STYLE}>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <h1 className="mb-5 text-2xl font-bold text-foreground">Marketers</h1>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* Action banner */}
          {banner && (
            <MarketerActionBanner
              message={banner.message}
              subtitle={banner.subtitle}
              onDismiss={onDismissBanner}
            />
          )}

          {/* ── Empty state ── */}
          {isEmpty && (
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <TelescopeIllustration />
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                No marketer here yet!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No list of marketers found here
              </p>
            </div>
          )}

          {/* ── Table ── */}
          {!isEmpty && (
            <div className="rounded-xl border bg-card">
              {/* Table header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b px-5 py-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    All Marketers
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage and monitor all marketers on the patform
                  </p>
                </div>
              </div>

              {/* Search + filters */}
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
                      Ascending
                    </span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <IconSortAscending className="inline size-3.5" />
                  </span>
                </div>
              </div>

              {/* Table */}
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
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Nick-name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(m.id)}
                            onChange={() => toggleSelect(m.id)}
                            className="rounded border-gray-300 accent-[#F97316]"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">
                            {m.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-foreground">
                          {m.nickname}
                        </td>
                        <td className="px-4 py-3.5 text-foreground">
                          {m.phone}
                        </td>
                        <td className="px-4 py-3.5">
                          <MarketerStatusBadge status={m.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedMarketer(m)}
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

              {/* Pagination */}
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

      {/* Quick-view modal */}
      {selectedMarketer && (
        <MarketerModal
          marketer={selectedMarketer}
          onClose={() => setSelectedMarketer(null)}
          onStatusChange={(id, status) => {
            onStatusChange(id, status);
            setSelectedMarketer(null);
          }}
          onViewDetails={(m) => {
            setSelectedMarketer(null);
            onViewDetails(m);
          }}
        />
      )}
    </SidebarProvider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "list-empty" | "details";
const INITIAL_VIEW: View = "list";

export default function MarketersPage() {
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [marketers, setMarketers] = useState<Marketer[]>(INITIAL_MARKETERS);
  const [detailsMarketer, setDetailsMarketer] = useState<Marketer | null>(null);
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  const handleStatusChange = useCallback(
    (id: string, newStatus: MarketerStatus) => {
      const marketer = marketers.find((m) => m.id === id);
      setMarketers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
      );
      if (!marketer) return;
      if (newStatus === "Suspended") {
        setBanner({
          message: "Marketer account has been Suspend",
          subtitle: `"${marketer.nickname}" has been suspended`,
        });
      } else if (newStatus === "Deactivated") {
        setBanner({
          message: "Marketer account has been deactivated",
          subtitle: `"${marketer.nickname}" has been deactivated`,
        });
      } else if (newStatus === "Active") {
        setBanner({
          message: "Marketer account has been activated",
          subtitle: `"${marketer.nickname}" is now active`,
        });
      }
    },
    [marketers],
  );

  const handleViewDetails = useCallback((marketer: Marketer) => {
    setDetailsMarketer(marketer);
    setView("details");
  }, []);

  if (view === "details" && detailsMarketer) {
    return (
      <MarketerDetailsPage
        marketer={detailsMarketer}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "list-empty") {
    return (
      <MarketersListPage
        marketers={[]}
        isEmpty
        banner={null}
        onDismissBanner={() => {}}
        onView={() => {}}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <MarketersListPage
      marketers={marketers}
      banner={banner}
      onDismissBanner={() => setBanner(null)}
      onView={() => {}}
      onViewDetails={handleViewDetails}
      onStatusChange={handleStatusChange}
    />
  );
}
