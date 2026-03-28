"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
  IconArrowLeft,
  IconPhone,
  IconMail,
  IconUser,
  IconEye,
} from "@tabler/icons-react";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { ExpandableDataTable } from "@/components/expandable-data-table";

// ─── Types ────────────────────────────────────────────────────────────────────

type SaleStatus =
  | "Processed"
  | "Failed"
  | "Ordered"
  | "In Process"
  | "Cancelled"
  | string;

interface SaleTransaction {
  id: string;
  requestId: string;
  marketerName: string;
  marketerRole?: string;
  vendorName: string;
  grossAmount: number;
  currency?: string;
  status: SaleStatus;
  // expanded row fields
  productName?: string;
  productImage?: string;
  platformFee?: number;
  affiliateCommission?: number;
  vendorPayout?: number;
  transactionDate?: string;
  // detail page fields
  transactionStripeId?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  affiliateCommissionPct?: number;
  vendorPayoutPct?: number;
  systemFeePct?: number;
  vendorContactPerson?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  vendorJoined?: string;
  affiliateUsername?: string;
  affiliatePhone?: string;
  affiliateEmail?: string;
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function fmt(amount: number, currency = "$"): string {
  return `${currency} ${amount.toLocaleString()}`;
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
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
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

function SaleBadge({ status }: { status: SaleStatus }) {
  const styles: Record<string, string> = {
    Processed: "border border-green-400 text-green-600",
    Failed: "text-red-500 border-0 bg-transparent font-medium",
    Ordered: "border border-gray-700 text-gray-800 font-semibold",
    "In Process": "border border-orange-300 text-orange-500",
    Cancelled: "text-red-500 border-0 bg-transparent font-medium",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-transparent",
        styles[status] ?? "border border-gray-300 text-gray-500"
      )}
    >
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
        Once vendors start making sales, they will appear here.
      </p>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SALES: SaleTransaction[] = [
  {
    id: "1",
    requestId: "ST-00290",
    marketerName: "Victor Wandulu",
    marketerRole: "Affiliate Marketer",
    vendorName: "World of Afrika",
    grossAmount: 400,
    status: "Processed",
    productName: "Kampala Niles App",
    productImage: "",
    platformFee: 1000,
    affiliateCommission: 2890,
    vendorPayout: 16000,
    transactionDate: "12/06/2025",
    transactionStripeId: "23456433TYH",
    customerName: "Mwirima Raymond",
    customerEmail: "raymuh@email.com",
    customerAddress: "William Strert 14th Lane\nKampala, Uganda",
    affiliateCommissionPct: 20,
    vendorPayoutPct: 70,
    systemFeePct: 10,
    vendorContactPerson: "Victor Wandulu",
    vendorPhone: "076407857",
    vendorEmail: "vicwand@tekjuice.com",
    vendorJoined: "16/02/2026",
    affiliateUsername: "VanVictor",
    affiliatePhone: "076407857",
    affiliateEmail: "vicwand@tekjuice.com",
  },
  { id: "2", requestId: "ST-00290", marketerName: "Lab-Ella", vendorName: "World of Afrika", grossAmount: 400, status: "Failed", productName: "Kampala Niles App", platformFee: 800, affiliateCommission: 2200, vendorPayout: 14000, transactionDate: "11/06/2025" },
  { id: "3", requestId: "ST-00290", marketerName: "Gogo256", vendorName: "World of Afrika", grossAmount: 400, status: "Processed", productName: "Kampala Niles App", platformFee: 900, affiliateCommission: 2500, vendorPayout: 15000, transactionDate: "11/06/2025" },
  { id: "4", requestId: "ST-00290", marketerName: "Innocentson", vendorName: "World of Afrika", grossAmount: 400, status: "Ordered", productName: "Kampala Niles App", platformFee: 700, affiliateCommission: 2100, vendorPayout: 13000, transactionDate: "10/06/2025" },
  { id: "5", requestId: "ST-00290", marketerName: "Muthobaby", vendorName: "World of Afrika", grossAmount: 400, status: "Processed", productName: "Kampala Niles App", platformFee: 1100, affiliateCommission: 3000, vendorPayout: 17000, transactionDate: "10/06/2025" },
  { id: "6", requestId: "ST-00290", marketerName: "TheLaw", vendorName: "World of Afrika", grossAmount: 400, status: "In Process", productName: "Kampala Niles App", platformFee: 600, affiliateCommission: 1800, vendorPayout: 12000, transactionDate: "10/06/2025" },
  { id: "7", requestId: "ST-00290", marketerName: "MeKhalid", vendorName: "World of Afrika", grossAmount: 400, status: "Processed", productName: "Kampala Niles App", platformFee: 950, affiliateCommission: 2700, vendorPayout: 15500, transactionDate: "09/06/2025" },
  { id: "8", requestId: "ST-00290", marketerName: "Quincyman", vendorName: "World of Afrika", grossAmount: 400, status: "Cancelled", productName: "Kampala Niles App", platformFee: 0, affiliateCommission: 0, vendorPayout: 0, transactionDate: "09/06/2025" },
  { id: "9", requestId: "ST-00290", marketerName: "Yvevy", vendorName: "World of Afrika", grossAmount: 400, status: "Processed", productName: "Kampala Niles App", platformFee: 880, affiliateCommission: 2600, vendorPayout: 14800, transactionDate: "08/06/2025" },
  { id: "10", requestId: "ST-00290", marketerName: "RevPeter", vendorName: "World of Afrika", grossAmount: 400, status: "Processed", productName: "Kampala Niles App", platformFee: 920, affiliateCommission: 2750, vendorPayout: 15200, transactionDate: "08/06/2025" },
];

const PAGE_SIZE = 10;

// ─── Sales detail view ────────────────────────────────────────────────────────

function SalesDetailView({
  sale,
  onBack,
}: {
  sale: SaleTransaction;
  onBack: () => void;
}) {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* ← Sales Details */}
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Sales Details</h1>
        </div>

        {/* Main detail card */}
        <div className="rounded-xl border bg-white p-6 mb-5">

          {/* Transaction + Customer side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mb-6">
            {/* Transaction */}
            <div className="pr-0 sm:pr-8 sm:border-r border-gray-100">
              <p className="text-sm font-semibold text-[#F97316] mb-3">Transaction</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                ID:&nbsp; {sale.requestId}
              </p>
              <p className="text-sm text-muted-foreground">
                Transaction date: {sale.transactionDate ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Stripe ID: {sale.transactionStripeId ?? "—"}
              </p>
            </div>

            {/* Customer */}
            <div className="sm:pl-8 mt-4 sm:mt-0">
              <p className="text-sm font-semibold text-[#F97316] mb-3">Customer</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                {sale.customerName ?? "—"}
              </p>
              {sale.customerEmail && (
                <p className="text-sm text-muted-foreground">Email: {sale.customerEmail}</p>
              )}
              {sale.customerAddress && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {sale.customerAddress.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product line-items table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Picture</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Product name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Gross Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Affiliate commission ({sale.affiliateCommissionPct ?? 20}%)
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Vendor payout ({sale.vendorPayoutPct ?? 70}%)
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    System fee ({sale.systemFeePct ?? 10}%)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Picture */}
                  <td className="px-5 py-4">
                    <div className="size-12 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {sale.productImage ? (
                        <img src={sale.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="size-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">IMG</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Product name */}
                  <td className="px-5 py-4 font-medium text-foreground">
                    {sale.productName ?? "—"}
                  </td>
                  {/* Gross Price */}
                  <td className="px-5 py-4 text-foreground">
                    {fmt(sale.grossAmount)}
                  </td>
                  {/* Affiliate commission */}
                  <td className="px-5 py-4 text-foreground">
                    {fmt(sale.affiliateCommission ?? 0)}
                  </td>
                  {/* Vendor payout */}
                  <td className="px-5 py-4 text-foreground">
                    {fmt(sale.vendorPayout ?? 0)}
                  </td>
                  {/* System fee */}
                  <td className="px-5 py-4 text-foreground">
                    {fmt(sale.platformFee ?? 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total transaction amount */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-foreground">Total transaction amount</p>
            <p className="text-2xl font-bold text-foreground">{fmt(sale.grossAmount)}</p>
          </div>
        </div>

        {/* Vendor + Affiliate details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Vendor Details */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#F97316]">Vendor Details</p>
              <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-1.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors">
                View <IconEye className="size-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-0.5">{sale.vendorName}</h2>
            {sale.vendorJoined && (
              <p className="text-sm font-medium text-[#F97316] mb-4">Joined {sale.vendorJoined}</p>
            )}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {[
                { Icon: IconUser, label: "Contact Person", value: sale.vendorContactPerson },
                { Icon: IconPhone, label: "Phone number", value: sale.vendorPhone },
                { Icon: IconMail, label: "Email Address", value: sale.vendorEmail },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4 shrink-0 text-gray-400" />
                    {label}
                  </div>
                  <span className="text-sm text-foreground">{value ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affiliate Details */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#F97316]">Affiliate Details</p>
              <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-1.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors">
                View <IconEye className="size-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-0.5">{sale.marketerName}</h2>
            {sale.affiliateUsername && (
              <p className="text-sm text-muted-foreground mb-4">{sale.affiliateUsername}</p>
            )}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {[
                { Icon: IconPhone, label: "Phone number", value: sale.affiliatePhone },
                { Icon: IconMail, label: "Email Address", value: sale.affiliateEmail },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4 shrink-0 text-gray-400" />
                    {label}
                  </div>
                  <span className="text-sm text-foreground">{value ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Sales list page ──────────────────────────────────────────────────────────

function SalesListPage({
  sales,
  onViewSale,
}: {
  sales: SaleTransaction[];
  onViewSale: (sale: SaleTransaction) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const salesLoading = false;

  // ── Stat derived values ──────────────────────────────────────────────────
  const globalGMV = sales.reduce((s, t) => s + t.grossAmount, 0);
  const platformEarnings = sales.reduce((s, t) => s + (t.platformFee ?? 0), 0);
  const affiliateCommissions = sales.reduce((s, t) => s + (t.affiliateCommission ?? 0), 0);
  const completedSales = sales.filter((t) => t.status === "Processed").length;

  const stats = [
    {
      title: "Global GMV",
      value: globalGMV.toLocaleString(),
      change: "+15%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Total Platform Earnings",
      value: `$${platformEarnings.toLocaleString()}`,
      change: "+5%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
    {
      title: "Affiliate Commissions",
      value: affiliateCommissions.toLocaleString(),
      change: "+5%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Completed Sales",
      value: completedSales.toLocaleString(),
      change: "+5%",
      icon: (
        <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
  ];

  // ── Column definitions ───────────────────────────────────────────────────
  const columns: ColumnDef<SaleTransaction>[] = [
    {
      id: "requestId",
      accessorKey: "requestId",
      header: "Request ID",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.requestId}</span>
      ),
    },
    {
      id: "marketer",
      accessorFn: (t) => t.marketerName,
      header: "Marketer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.marketerName}</p>
          {row.original.marketerRole && (
            <p className="text-xs text-muted-foreground">{row.original.marketerRole}</p>
          )}
        </div>
      ),
    },
    {
      id: "vendorName",
      accessorKey: "vendorName",
      header: "Vendor name",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.vendorName}</span>
      ),
    },
    {
      id: "grossAmount",
      accessorKey: "grossAmount",
      header: "Gross amount",
      cell: ({ row }) => (
        <span className="text-foreground">${row.original.grossAmount.toLocaleString()}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <SaleBadge status={row.original.status} />,
    },
    {
      id: "view",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => onViewSale(row.original)}
          className="flex items-center justify-center size-7 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground hover:text-[#F97316]"
        >
          <IconEye className="size-4" />
        </button>
      ),
    },
  ];

  // ── Expanded row ─────────────────────────────────────────────────────────
  const renderExpandedRow = (row: Row<SaleTransaction>) => {
    const sale = row.original;
    return (
      <div className="flex items-center gap-4">
        {/* Product image + name */}
        <div className="flex items-center gap-3 shrink-0 min-w-[180px]">
          <div className="size-12 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
            {sale.productImage ? (
              <img src={sale.productImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">IMG</span>
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-foreground">{sale.productName ?? "—"}</span>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0" />

        {/* Platform Fee */}
        <div className="flex-1 px-4">
          <p className="text-xs text-muted-foreground mb-1">Platform Fee</p>
          <p className="text-sm font-bold text-foreground">
            ${(sale.platformFee ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0" />

        {/* Affiliate Commission */}
        <div className="flex-1 px-4">
          <p className="text-xs text-muted-foreground mb-1">Affiliate Commission</p>
          <p className="text-sm font-bold text-foreground">
            ${(sale.affiliateCommission ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0" />

        {/* Vendor Payout */}
        <div className="flex-1 px-4">
          <p className="text-xs text-muted-foreground mb-1">Vendor Payout</p>
          <p className="text-sm font-bold text-foreground">
            ${(sale.vendorPayout ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0" />

        {/* Transaction date */}
        <div className="flex-1 px-4">
          <p className="text-xs text-muted-foreground mb-1">Transaction date</p>
          <p className="text-sm font-bold text-foreground">
            {sale.transactionDate ?? "—"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* Page title */}
        <h1 className="mb-5 text-2xl font-bold text-foreground">Sales</h1>

        {/* 4 stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* ExpandableDataTable */}
        <ExpandableDataTable
          columns={columns}
          data={sales}
          loading={salesLoading}
          skeletonRows={8}
          // Toolbar
          title="Transaction History"
          description="Manage transactions made on the platform"
          // Search
          searchColumn="marketer"
          searchPlaceholder="Search"
          // Toolbar controls
          showFilters
          showSort
          sortLabel="Ascending"
          // Selection
          showSelection
          // Pagination
          showPagination
          pageSize={PAGE_SIZE}
          total={sales.length}
          page={currentPage}
          onPageChange={setCurrentPage}
          // Expandable row
          renderExpandedRow={renderExpandedRow}
          // Empty state
          emptyState={<TelescopeEmptyState />}
        />
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "detail";

export default function SalesPage() {
  const [view, setView] = useState<View>("list");
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);

  // Replace MOCK_SALES with your Redux hook when ready
  const sales = MOCK_SALES;

  const handleView = useCallback((sale: SaleTransaction) => {
    setSelectedSale(sale);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSale(null);
    setView("list");
  }, []);

  if (view === "detail" && selectedSale) {
    return <SalesDetailView sale={selectedSale} onBack={handleBack} />;
  }

  return <SalesListPage sales={sales} onViewSale={handleView} />;
}