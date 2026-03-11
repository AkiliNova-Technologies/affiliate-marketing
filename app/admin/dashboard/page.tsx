"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { IconExternalLink, IconChevronDown } from "@tabler/icons-react"
import { type ColumnDef } from "@tanstack/react-table"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SectionCards } from "@/components/section-cards"
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useReduxAuth } from "@/hooks/useReduxAuth"

// ─── Skeleton shown while charts load ─────────────────────────────────────────
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border bg-muted/30 ${className ?? "h-[320px]"}`}
    />
  )
}

// ─── Dynamic chart imports (ssr: false) ────────────────────────────────────────
const PlatformEarningsTrend = dynamic(
  () => import("@/components/charts/platform-earnings-trend"),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

const SalesByCategory = dynamic(
  () => import("@/components/charts/sales-by-category"),
  { ssr: false, loading: () => <ChartSkeleton className="h-full min-h-[260px]" /> }
)

const TopPerformingVendors = dynamic(
  () => import("@/components/charts/top-performing-vendors"),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

// ─── Product Approval table ────────────────────────────────────────────────────

interface ProductApprovalRow {
  id: number
  vendor: string
  product: string
  status: string
}

const productApprovalData: ProductApprovalRow[] = [
  { id: 1, vendor: "Maharia Library", product: "The Life of Amin", status: "Pending activation" },
  { id: 2, vendor: "Poa Safaris", product: "Trip to Kigezi", status: "Pending re-approval" },
  { id: 3, vendor: "World of Africa", product: "Cow Hide Shoes", status: "Pending activation" },
  { id: 4, vendor: "Lucy's Decor", product: "Out door event", status: "Pending activation" },
  { id: 5, vendor: "Tek Technologies", product: "Accounting System", status: "Pending re-approval" },
]

const productApprovalColumns: ColumnDef<ProductApprovalRow>[] = [
  // {
  //   accessorKey: "id",
  //   header: "Vendor",
  //   cell: ({ row }) => (
  //     <span className="text-muted-foreground text-sm">{row.original.id}.</span>
  //   ),
  // },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.vendor}</span>
    ),
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => <span className="text-sm">{row.original.product}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "action",
    header: "Action",
    cell: () => <ViewAction />,
  },
]

// ─── Campaigns table ───────────────────────────────────────────────────────────

interface CampaignRow {
  id: number
  marketer: string
  product: string
}

const campaignsData: CampaignRow[] = [
  { id: 1, marketer: "VanVictor", product: "Kampala Nite App" },
  { id: 2, marketer: "Lab-Ella", product: "Social Gems" },
  { id: 3, marketer: "Gogo-246", product: "World of Africa" },
  { id: 4, marketer: "Innocentson", product: "Horus" },
  { id: 5, marketer: "Muthobaby", product: "Horus" },
]

const campaignsColumns: ColumnDef<CampaignRow>[] = [
  // {
  //   accessorKey: "id",
  //   header: "Marketer",
  //   cell: ({ row }) => (
  //     <span className="text-muted-foreground text-sm">{row.original.id}.</span>
  //   ),
  // },
  {
    accessorKey: "marketer",
    header: "Marketer",
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.marketer}</span>
    ),
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => <span className="text-sm">{row.original.product}</span>,
  },
  {
    id: "action",
    header: "Action",
    cell: () => <ViewAction />,
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const {user, loading} = useReduxAuth();
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

        <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6 bg-[#F7F7F7]">
          {/* Greeting */}
          <h1 className="text-2xl font-bold text-foreground">
            Hi {user?.firstName || "there"}, here&apos;s how the system looks today
          </h1>

          {/* Stat cards */}
          <SectionCards />

          {/* Product Approval + Sales by Category */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            {/* Product Approval */}
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Product Approval</h3>
                  <p className="text-xs text-muted-foreground">
                    A list of products pending approval and reapproval
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 border-[#F97316] bg-[#F97316] text-white hover:bg-[#F97316]/90 hover:text-white text-xs"
                >
                  View All <IconExternalLink className="size-3" />
                </Button>
              </div>
              <DataTable
                columns={productApprovalColumns}
                data={productApprovalData}
                pageSize={5}
              />
            </div>

            {/* Sales by Category — client-only */}
            <div className="rounded-xl border bg-card p-5">
              <SalesByCategory />
            </div>
          </div>

          {/* Earnings Trend + Campaigns Overview */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Platform Earnings Trend — client-only */}
            <PlatformEarningsTrend />

            {/* Campaigns Overview */}
            <div className="rounded-xl border bg-card p-5 ">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Campaigns Overview</h3>
                  <p className="text-xs text-muted-foreground">
                    All Marketer Campaigns within the system
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 border-[#F97316] bg-[#F97316] text-white hover:bg-[#F97316]/90 hover:text-white text-xs"
                >
                  View All <IconExternalLink className="size-3" />
                </Button>
              </div>
              <DataTable
                columns={campaignsColumns}
                data={campaignsData}
                pageSize={5}
              />
            </div>
          </div>

          {/* Top Performing Vendors — client-only */}
          <TopPerformingVendors />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}