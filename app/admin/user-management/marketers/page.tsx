// app/admin/user-management/marketers/page.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconX,
  IconArrowLeft,
  IconAlertCircle,
  IconCircleDashed,
  IconPhone,
  IconMail,
  IconCurrencyDollar,
  IconTrendingUp,
  IconCopy,
  IconCheck,
  IconRefresh,
  IconEye,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import type { Marketer } from "@/redux/slices/adminMarketersSlice";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketerStatus = "Active" | "Suspended" | "Deactivated" | "Deleted";

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

// ─── Mock campaigns ───────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 64)",
  "--header-height": "calc(var(--spacing) * 14)",
} as React.CSSProperties;

const PAGE_SIZE = 10;

// ─── Status actions map ───────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplayStatus(raw: string | undefined): MarketerStatus {
  const map: Record<string, MarketerStatus> = {
    ACTIVE: "Active",
    active: "Active",
    Active: "Active",
    SUSPENDED: "Suspended",
    suspended: "Suspended",
    Suspended: "Suspended",
    DEACTIVATED: "Deactivated",
    deactivated: "Deactivated",
    Deactivated: "Deactivated",
    DELETED: "Deleted",
    deleted: "Deleted",
    Deleted: "Deleted",
  };
  return map[raw ?? ""] ?? "Deactivated";
}

function getDisplayName(m: Marketer): string {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || "—";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(campaign.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl border bg-[#F7F7F7] overflow-hidden">
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
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-50 pt-3 bg-white rounded-lg p-3 px-6">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Clicks</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.totalClicks}
            </p>
          </div>
          <div className="min-h-[30px] w-[2px] bg-[#F7F7F7] border" />
          <div>
            <p className="text-[10px] text-muted-foreground">Conversion rate</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.conversionRate}
            </p>
          </div>
          <div className="min-h-[30px] w-[2px] bg-[#F7F7F7] border" />
          <div>
            <p className="text-[10px] text-muted-foreground">Total Sales</p>
            <p className="text-xs font-semibold text-foreground">
              {campaign.totalSales}
            </p>
          </div>
        </div>
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

// ─── Quick-view Modal ─────────────────────────────────────────────────────────

function MarketerModal({
  marketer,
  onClose,
  onStatusChange,
  onViewDetails,
}: {
  marketer: Marketer;
  onClose: () => void;
  onStatusChange: (id: string, status: MarketerStatus) => void;
  onViewDetails: (marketer: Marketer) => void;
}) {
  const displayStatus = toDisplayStatus(marketer.status);
  const actions = STATUS_ACTIONS[displayStatus] ?? [];
  const isActive = displayStatus === "Active";
  const name = getDisplayName(marketer);

  const handleAction = (action: string) => {
    onStatusChange(marketer.id, action as MarketerStatus);
    onClose();
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

          <div className="p-8 pt-16 max-h-[90vh] overflow-y-auto">
            <div className="flex gap-8 mb-6">
              {/* Avatar */}
              <div className="relative shrink-0 h-32 w-32">
                <AvatarInitials name={name} size="xl" />
                {isActive && (
                  <div className="absolute bottom-2.5 right-1 flex items-center justify-center size-6 rounded-full bg-green-500 border-2 border-white">
                    <IconCheck className="size-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {name}
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

                <div className="border-t border-gray-100 my-4" />

                <div className="grid grid-cols-1 gap-x-8 gap-y-3 mb-8">
                  {[
                    {
                      Icon: IconCircleDashed,
                      label: "Status",
                      value: <StatusBadge status={displayStatus} />,
                    },
                    {
                      Icon: IconPhone,
                      label: "Phone number",
                      value: marketer.phoneNumber ?? marketer.phone ?? "—",
                    },
                    {
                      Icon: IconMail,
                      label: "Email Address",
                      value: marketer.email,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="grid grid-cols-2 items-start gap-2.5"
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
                      $ {(marketer.netRevenue ?? 0).toLocaleString()}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-semibold",
                        (marketer.revenueChange ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-500",
                      )}
                    >
                      <IconTrendingUp className="size-4" />
                      <span>
                        {(marketer.revenueChange ?? 0) >= 0 ? "+" : ""}
                        {marketer.revenueChange ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Status */}
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
                          className={cn(a.danger && "text-red-500 font-medium")}
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

// ─── Marketer Details Page ────────────────────────────────────────────────────

function MarketerDetailsPage({
  marketer,
  onBack,
}: {
  marketer: Marketer;
  onBack: () => void;
}) {
  const { loadMarketerById, selectedMarketer, marketersLoading } =
    useReduxAdmin();
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMarketerById(marketer.id);
  }, [marketer.id, loadMarketerById]);

  const m = selectedMarketer ?? marketer;
  const displayStatus = toDisplayStatus(m.status);
  const name = getDisplayName(m);

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
            {marketersLoading && (
              <IconRefresh className="size-4 text-muted-foreground animate-spin ml-1" />
            )}
          </div>

          {/* Profile card */}
          <div className="mb-6 rounded-xl border bg-white p-6">
            <div className="flex items-start gap-5 mb-5">
              <div className="relative shrink-0">
                <AvatarInitials name={name} size="lg" />
                {displayStatus === "Active" && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-6 rounded-full bg-green-500 border-2 border-white">
                    <IconCheck
                      className="size-3.5 text-white"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {m.nickname}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 mb-4" />

            <div className="flex gap-6 flex-wrap">
              <div className="flex-1 min-w-[260px] divide-y divide-gray-50">
                {[
                  {
                    Icon: IconCircleDashed,
                    label: "Status",
                    value: <StatusBadge status={displayStatus} />,
                  },
                  {
                    Icon: IconPhone,
                    label: "Phone number",
                    value: m.phoneNumber ?? m.phone ?? "—",
                  },
                  { Icon: IconMail, label: "Email Address", value: m.email },
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
                    $ {(m.netRevenue ?? 0).toLocaleString()}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold",
                      (m.revenueChange ?? 0) >= 0
                        ? "text-green-600"
                        : "text-red-500",
                    )}
                  >
                    <IconTrendingUp className="size-4" />
                    <span>
                      {(m.revenueChange ?? 0) >= 0 ? "+" : ""}
                      {m.revenueChange ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns */}
          <div className="p-6 rounded-xl bg-white">
            <h3 className="text-lg font-bold text-foreground">
              {name.split(" ")[0]}&apos;s campaigns
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              List of products that marketer has generated links for.
            </p>
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

function MarketersListPage({
  banner,
  onDismissBanner,
  onViewDetails,
  onStatusChange,
}: {
  banner: { message: string; subtitle: string } | null;
  onDismissBanner: () => void;
  onViewDetails: (marketer: Marketer) => void;
  onStatusChange: (id: string, status: MarketerStatus) => void;
}) {
  const {
    marketers,
    marketersTotal,
    marketersLoading,
    marketersError,
    loadMarketers,
  } = useReduxAdmin();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(
    null,
  );

  // Debounce search by 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reload on page or search change
  useEffect(() => {
    loadMarketers({
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    });
  }, [currentPage, debouncedSearch, loadMarketers]);

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<Marketer>[] = [
    {
      id: "name",
      accessorFn: (m) => getDisplayName(m),
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {getDisplayName(row.original)}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "nickname",
      accessorKey: "nickname",
      header: "Nick-name",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.nickname ?? "—"}
        </span>
      ),
    },
    {
      id: "phone",
      accessorFn: (m) => m.phoneNumber ?? m.phone ?? "—",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.phoneNumber ?? row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (m) => m.status,
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={toDisplayStatus(row.original.status)} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ViewAction onClick={() => setSelectedMarketer(row.original)} />
      ),
    },
  ];

  const stats = [
    {
      title: "Total Marketers",
      value: marketersTotal ?? 0,
      change: "+15%",
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
      title: "Active Marketers",
      value: marketers.filter((m) => toDisplayStatus(m.status) === "Active")
        .length,
      change: "+5%",
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
      value: marketers.filter((m) => toDisplayStatus(m.status) === "Suspended")
        .length,
      change: undefined,
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
      value: `$${marketers.reduce((sum, m) => sum + (m.netRevenue ?? 0), 0).toLocaleString()}`,
      change: "+5%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <SidebarProvider style={SIDEBAR_STYLE}>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
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

          {/* Error banner */}
          {marketersError && (
            <div className="mb-5 flex items-start gap-3 rounded-md border-l-4 border-l-red-500 border border-red-100 bg-red-50 px-5 py-4">
              <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-900">
                  {marketersError}
                </p>
              </div>
              <button
                onClick={() =>
                  loadMarketers({ page: currentPage, limit: PAGE_SIZE })
                }
                className="shrink-0 text-xs font-semibold text-red-600 underline underline-offset-2 hover:no-underline transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── DataTable ── */}
          <div className="rounded-xl">
            <DataTable
              columns={columns}
              data={marketers}
              loading={marketersLoading}
              skeletonRows={8}
              title="All Marketers"
              description="Manage and monitor all marketers on the platform"
              searchColumn="name"
              searchPlaceholder="Search"
              showFilters
              showSort
              sortLabel="Ascending"
              showSelection
              showPagination
              pageSize={PAGE_SIZE}
              total={marketersTotal ?? 0}
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

export default function MarketersPage() {
  const [view, setView] = useState<"list" | "details">("list");
  const [detailsMarketer, setDetailsMarketer] = useState<Marketer | null>(null);
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  const handleViewDetails = useCallback((marketer: Marketer) => {
    setDetailsMarketer(marketer);
    setView("details");
  }, []);

  const handleStatusChange = useCallback(
    (id: string, newStatus: MarketerStatus) => {
      setBanner({
        message:
          newStatus === "Suspended"
            ? "Marketer account has been suspended"
            : newStatus === "Deactivated"
              ? "Marketer account has been deactivated"
              : "Marketer account has been activated",
        subtitle: `Marketer ID "${id}" status changed to ${newStatus}`,
      });
    },
    [],
  );

  if (view === "details" && detailsMarketer) {
    return (
      <MarketerDetailsPage
        marketer={detailsMarketer}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <MarketersListPage
      banner={banner}
      onDismissBanner={() => setBanner(null)}
      onViewDetails={handleViewDetails}
      onStatusChange={handleStatusChange}
    />
  );
}
