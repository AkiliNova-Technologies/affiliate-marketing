"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconPackage,
  IconClock,
  IconCurrencyDollar,
  IconBan,
  IconEye,
  IconX,
} from "@tabler/icons-react";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  productName?: string;
  name?: string;
  productImage?: string;
  imageUrl?: string;
  marketer?: string;
  marketerName?: string;
  vendor?: string;
  vendorName?: string;
  status?: string;
  totalClicks?: number;
  clicks?: number;
  conversionRate?: number;
  conversion?: number;
  totalSales?: number;
  sales?: number;
  productId?: string;
}

type CampaignDisplayStatus =
  | "Active"
  | "Suspended"
  | "Paused"
  | "Unavailable"
  | "Inactive"
  | string;

// ─── Field helpers ────────────────────────────────────────────────────────────

function getCampaignProductName(c: Campaign): string {
  return c.productName ?? c.name ?? "—";
}
function getCampaignImage(c: Campaign): string | undefined {
  return c.productImage ?? c.imageUrl;
}
function getCampaignMarketer(c: Campaign): string {
  return c.marketer ?? c.marketerName ?? "—";
}
function getCampaignVendor(c: Campaign): string {
  return c.vendor ?? c.vendorName ?? "—";
}
function getCampaignStatus(c: Campaign): CampaignDisplayStatus {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    PAUSED: "Paused",
    UNAVAILABLE: "Unavailable",
    INACTIVE: "Inactive",
  };
  return map[(c.status ?? "").toUpperCase()] ?? c.status ?? "—";
}
function getCampaignClicks(c: Campaign): number {
  return c.totalClicks ?? c.clicks ?? 0;
}
function getCampaignConversion(c: Campaign): number {
  return c.conversionRate ?? c.conversion ?? 0;
}
function getCampaignSales(c: Campaign): number {
  return c.totalSales ?? c.sales ?? 0;
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

function CampaignStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border border-green-300 text-green-700 bg-transparent",
    Suspended: "border border-gray-400 text-gray-600 bg-transparent",
    Paused: "border border-orange-300 text-orange-600 bg-transparent",
    Unavailable: "border border-gray-300 text-gray-500 bg-transparent",
    Inactive: "border border-gray-300 text-gray-500 bg-transparent",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      styles[status] ?? "border border-gray-300 text-gray-500 bg-transparent"
    )}>
      {status}
    </span>
  );
}

// ─── Telescope empty state ────────────────────────────────────────────────────

function TelescopeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="size-56 rounded-full bg-gray-100 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-40 h-40" fill="none">
          <circle cx="62" cy="55" r="22" fill="#1a1a1a" />
          <text x="62" y="63" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white">?</text>
          <rect x="70" y="90" width="50" height="12" rx="3" fill="#1a1a1a" transform="rotate(-30 70 90)" />
          <rect x="82" y="104" width="38" height="10" rx="3" fill="#1a1a1a" transform="rotate(-30 82 104)" />
          <line x1="95" y1="125" x2="80" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="125" x2="95" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="125" x2="110" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          {([[112, 55], [125, 70], [118, 42]] as [number, number][]).map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="14" fill="#1a1a1a">+</text>
          ))}
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-2">Nothing here yet!</h3>
      <p className="text-sm text-muted-foreground">
        Once marketers start creating campaigns, they will appear here.
      </p>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "1", productName: "Kampala Niles App", productImage: "", marketer: "VanVictor", vendor: "Everything Uganda", status: "ACTIVE", totalClicks: 20000, conversionRate: 89, totalSales: 16000 },
  { id: "2", productName: "Kampala Niles App", productImage: "", marketer: "Social Gems", vendor: "Social Gems", status: "ACTIVE", totalClicks: 5000, conversionRate: 72, totalSales: 3600 },
  { id: "3", productName: "The Night I fell in Love-ebook", productImage: "", marketer: "VanVictor", vendor: "Everything Uganda", status: "ACTIVE", totalClicks: 8000, conversionRate: 65, totalSales: 5200 },
  { id: "4", productName: "Wedding Photography", productImage: "", marketer: "VanVictor", vendor: "World of Africa", status: "ACTIVE", totalClicks: 3200, conversionRate: 45, totalSales: 1440 },
  { id: "5", productName: "Safe-jaj app", productImage: "", marketer: "VanVictor", vendor: "Horus", status: "PAUSED", totalClicks: 1100, conversionRate: 12, totalSales: 132 },
  { id: "6", productName: "ESM School Manager", productImage: "", marketer: "VanVictor", vendor: "World of Africa", status: "UNAVAILABLE", totalClicks: 0, conversionRate: 0, totalSales: 0 },
  { id: "7", productName: "Savanna Records", productImage: "", marketer: "VanVictor", vendor: "Social Gens", status: "ACTIVE", totalClicks: 9400, conversionRate: 58, totalSales: 5452 },
];

const PAGE_SIZE = 10;

// ─── Campaigns page ───────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [banner, setBanner] = useState<{ message: string; subtitle: string } | null>(null);

  // Replace with Redux hook when available:
  // const { campaigns, campaignsLoading, campaignsTotal, loadCampaigns } = useReduxAdmin();
  const campaigns: Campaign[] = MOCK_CAMPAIGNS;
  const campaignsTotal = MOCK_CAMPAIGNS.length;
  const campaignsLoading = false;

  const totalCampaigns = campaignsTotal;
  const activeCampaigns = campaigns.filter((c) => (c.status ?? "").toUpperCase() === "ACTIVE").length;
  const suspendedCampaigns = campaigns.filter((c) => (c.status ?? "").toUpperCase() === "SUSPENDED").length;

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<Campaign>[] = [
    {
      id: "picture",
      header: "Picture",
      cell: ({ row }) => {
        const img = getCampaignImage(row.original);
        return (
          <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconPackage className="size-5 text-gray-300" />
            )}
          </div>
        );
      },
    },
    {
      id: "productName",
      accessorFn: (c) => getCampaignProductName(c),
      header: "Product name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {getCampaignProductName(row.original)}
        </span>
      ),
    },
    {
      id: "marketer",
      accessorFn: (c) => getCampaignMarketer(c),
      header: "Marketer",
      cell: ({ row }) => (
        <span className="text-foreground">{getCampaignMarketer(row.original)}</span>
      ),
    },
    {
      id: "vendor",
      accessorFn: (c) => getCampaignVendor(c),
      header: "Vendor",
      cell: ({ row }) => (
        <span className="text-foreground">{getCampaignVendor(row.original)}</span>
      ),
    },
    {
      id: "status",
      accessorFn: (c) => getCampaignStatus(c),
      header: "Status",
      cell: ({ row }) => (
        <CampaignStatusBadge status={getCampaignStatus(row.original)} />
      ),
    },
  ];

  // ── Expanded row renderer ───────────────────────────────────────────────────
  const renderExpandedRow = (row: Row<Campaign>) => {
    const campaign = row.original;
    return (
      <div className="flex items-center justify-between gap-6">
        {/* Stats */}
        <div className="flex items-center flex-1 gap-0">
          <div className="flex-1 pr-6">
            <p className="text-xs text-muted-foreground mb-1">Total Clicks</p>
            <p className="text-lg font-bold text-foreground">
              {getCampaignClicks(campaign).toLocaleString()}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200 mx-2 shrink-0" />
          <div className="flex-1 px-6">
            <p className="text-xs text-muted-foreground mb-1">Conversion rate</p>
            <p className="text-lg font-bold text-foreground">
              {getCampaignConversion(campaign)}%
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200 mx-2 shrink-0" />
          <div className="flex-1 px-6">
            <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
            <p className="text-lg font-bold text-foreground">
              {getCampaignSales(campaign).toLocaleString()}
            </p>
          </div>
        </div>
        {/* View Product Details */}
        <button
          onClick={() => console.log("View product", campaign.productId ?? campaign.id)}
          className="flex items-center gap-2 rounded-md bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors shrink-0"
        >
          View Product Details <IconEye className="size-4" />
        </button>
      </div>
    );
  };

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaigns.toLocaleString(),
      change: "+15%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 10l-4 4L6 8" /><circle cx="12" cy="12" r="10" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active campaigns",
      value: activeCampaigns.toLocaleString(),
      change: "+5%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Suspended",
      value: suspendedCampaigns.toLocaleString(),
      change: "+5%",
      icon: <IconBan className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: "$40,000",
      change: "+5%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* Page title */}
        <h1 className="mb-5 text-2xl font-bold text-foreground">Campaigns overview</h1>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Action banner */}
        {banner && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border-l-4 border-l-blue-500 border border-blue-100 bg-blue-50 px-5 py-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-5 shrink-0 text-blue-500">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900">{banner.message}</p>
              <p className="mt-0.5 text-xs text-blue-700">{banner.subtitle}</p>
            </div>
            <button onClick={() => setBanner(null)} className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors">
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* ExpandableDataTable */}
        <ExpandableDataTable
          columns={columns}
          data={campaigns}
          loading={campaignsLoading}
          skeletonRows={8}
          title="All campaigns"
          description="Manage and monitor all campaigns on the platform"
          searchColumn="productName"
          searchPlaceholder="Search"
          showFilters
          showSort
          sortLabel="Ascending"
          showSelection
          showPagination
          pageSize={PAGE_SIZE}
          total={campaignsTotal}
          page={currentPage}
          onPageChange={setCurrentPage}
          renderExpandedRow={renderExpandedRow}
          emptyState={<TelescopeEmptyState />}
        />
      </div>
    </PageShell>
  );
}