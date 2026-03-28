"use client";

import * as React from "react";
import {
  IconExternalLink,
  IconCurrencyDollar,
  IconBroadcast,
  IconPercentage,
} from "@tabler/icons-react";
import { TrendingUpIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MarketerAppSidebar } from "@/components/marketer-app-sidebar";
import { DataTable } from "@/components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignRow {
  id: string;
  coverImage: string;
  productName: string;
  vendor: string;
  clicks: number;
  sales: number;
  conversion: number;
}

interface ChartPoint {
  month: string;
  totalSales: number;
  totalClicks: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CAMPAIGN_ROWS: CampaignRow[] = [
  { id: "1", coverImage: "/placeholder-product.jpeg", productName: "Kampala Niles App",      vendor: "World of Afrika",        clicks: 300000, sales: 10000, conversion: 50 },
  { id: "2", coverImage: "/placeholder-product.jpeg", productName: "Kavuma's Creative Class", vendor: "Social Gems",            clicks: 10000,  sales: 3000,  conversion: 50 },
  { id: "3", coverImage: "/placeholder-product.jpeg", productName: "Safe-jaj app",            vendor: "Africa Connect",         clicks: 40000,  sales: 1000,  conversion: 30 },
  { id: "4", coverImage: "/placeholder-product.jpeg", productName: "ESM School Manager",      vendor: "Everything Uganda",      clicks: 20000,  sales: 18000, conversion: 10 },
  { id: "5", coverImage: "/placeholder-product.jpeg", productName: "Savanna Records",         vendor: "Task Reporting System",  clicks: 1000,   sales: 4000,  conversion: 90 },
  { id: "6", coverImage: "/placeholder-product.jpeg", productName: "Chimpman Deliveries",     vendor: "Colaw",                  clicks: 10000,  sales: 2000,  conversion: 70 },
];

const CHART_DATA: ChartPoint[] = [
  { month: "May",    totalSales: 280000, totalClicks: 200000 },
  { month: "",       totalSales: 295000, totalClicks: 230000 },
  { month: "",       totalSales: 310000, totalClicks: 250000 },
  { month: "June",   totalSales: 305000, totalClicks: 270000 },
  { month: "",       totalSales: 320000, totalClicks: 290000 },
  { month: "",       totalSales: 360000, totalClicks: 295000 },
  { month: "July",   totalSales: 430000, totalClicks: 310000 },
  { month: "",       totalSales: 410000, totalClicks: 320000 },
  { month: "",       totalSales: 395000, totalClicks: 330000 },
  { month: "August", totalSales: 400000, totalClicks: 345000 },
];

// ─── Campaign table columns ───────────────────────────────────────────────────

const CAMPAIGN_COLUMNS: ColumnDef<CampaignRow, unknown>[] = [
  {
    id: "picture",
    header: "Picture",
    cell: ({ row }) => (
      <div className="size-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
        <img
          src={row.original.coverImage}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpeg"; }}
        />
      </div>
    ),
  },
  {
    accessorKey: "productName",
    header: "Product name",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.productName}</span>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.vendor}</span>
    ),
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
    cell: ({ row }) => (
      <span className="text-foreground">{fmt(row.original.clicks)}</span>
    ),
  },
  {
    accessorKey: "sales",
    header: "Sales",
    cell: ({ row }) => (
      <span className="text-foreground">{fmt(row.original.sales)}</span>
    ),
  },
  {
    accessorKey: "conversion",
    header: "Conversion",
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.conversion}%</span>
    ),
  },
];



interface StatCardDef {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}

const STAT_CARDS: StatCardDef[] = [
  {
    title: "Total Commission Earned",
    value: "2,000",
    change: "+15%",
    icon: IconCurrencyDollar,
    gradient: "from-[#F97316] to-[#FB923C]",
    iconBg: "bg-white/20",
  },
  {
    title: "Total Active Campaigns",
    value: "40",
    change: "+5%",
    icon: IconBroadcast,
    gradient: "from-[#EA580C] to-[#C2410C]",
    iconBg: "bg-white/20",
  },
  {
    title: "Overall Conversion Rate",
    value: "70%",
    change: "+5%",
    icon: IconPercentage,
    gradient: "from-[#92400E] to-[#78350F]",
    iconBg: "bg-white/20",
  },
];

function StatCard({ card }: { card: StatCardDef }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-sm",
        card.gradient,
      )}
    >
      {/* Decorative wave lines — identical to section-cards.tsx */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path d="M0 60 Q50 30 100 55 T200 45" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M0 75 Q60 45 120 65 T200 60" fill="none" stroke="white" strokeWidth="1" />
        <path d="M0 90 Q70 60 130 80 T200 75" fill="none" stroke="white" strokeWidth="0.75" />
      </svg>
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">{card.title}</p>
            <div className={cn("rounded-lg p-2", card.iconBg)}>
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

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)},000`;
  return n.toLocaleString();
}

function fmtAxis(v: number): string {
  // Same style as platform-earnings-trend.tsx tickFormatter
  if (v >= 1000000) return `${v / 1000000}M`;
  if (v >= 1000) return `${v / 1000}k`;
  return String(v);
}

// ─── Custom tooltip — matches platform-earnings-trend.tsx contentStyle ────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 8,
        fontSize: 12,
        padding: "8px 12px",
      }}
    >
      {label && (
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      )}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke, fontWeight: 500 }}>
          {p.dataKey === "totalSales" ? "Total Sales" : "•Total Clicks"}: {fmtAxis(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketerDashboardPage() {
  const { user } = useReduxAuth();
  const firstName = user?.firstName ?? "Victor";
  const router = useRouter();

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <MarketerAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen gap-5">

          {/* Personalised greeting */}
          <h1 className="text-2xl font-bold text-foreground">
            {firstName}, your insights are ready
          </h1>

          {/* ── Stat cards — same grid as SectionCards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.title} card={card} />
            ))}
          </div>

          {/* ── Campaign Performance Overview — DataTable ── */}
          <DataTable
            columns={CAMPAIGN_COLUMNS}
            data={CAMPAIGN_ROWS}
            title="Campaign Performance Overview"
            description="Which campaigns should you focus more on?"
            showFilters
            showSort
            sortLabel="Price"
            showSelection={false}
            showPagination={false}
            headerAction={
              <button className="flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors whitespace-nowrap" onClick={()=> router.push("/marketer/campaigns")}>
                View All My Campaigns <IconExternalLink className="size-4" />
              </button>
            }
          />

          {/* ── Sales & Earnings Trend ── */}
          {/* Same component structure as platform-earnings-trend.tsx */}
          <div className="rounded-xl border bg-card p-5">
            <div>
              <h3 className="font-semibold text-foreground">Sales & Earnings Trend</h3>
              <p className="text-xs text-muted-foreground">
                Is my traffic growing? Are my sales keeping pace?
              </p>
            </div>

            <div className="border-t border-gray-100 my-4" />

            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={CHART_DATA}
                margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={true}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={fmtAxis}
                  domain={[100000, 600000]}
                  ticks={[100000, 200000, 300000, 400000, 500000, 600000]}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="plainline"
                  iconSize={16}
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(value) =>
                    value === "totalSales" ? "Total Sales" : "•Total Clicks"
                  }
                />
                {/* Total Sales — orange solid (matches design) */}
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#F97316" }}
                />
                {/* Total Clicks — foreground dashed (matches design) */}
                <Line
                  type="monotone"
                  dataKey="totalClicks"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}