"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  IconPackage,
  IconClock,
  IconTrendingUp,
  IconCurrencyDollar,
  IconFilter,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string;
  image?: string;
  name: string;
  price: number;
  status: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: ProductRow[] = [
  { id: "1", name: "Kampala Niles App", price: 20000, status: "Active" },
  {
    id: "2",
    name: "Kavuma's Creative Class",
    price: 400000,
    status: "Deleted",
  },
  { id: "3", name: "Safe-jaj app", price: 10000, status: "Suspended" },
  { id: "4", name: "ESM School Manager", price: 800000, status: "Deleted" },
  { id: "5", name: "Savanna Records", price: 100000, status: "Active" },
  { id: "6", name: "Chimpman Deliveries", price: 250000, status: "Suspended" },
];

const TREND_DATA = [
  { month: "May", value: 310000 },
  { month: "Jun", value: 260000 },
  { month: "Jul", value: 340000 },
  { month: "Aug", value: 300000 },
  { month: "Sep", value: 280000 },
  { month: "Oct", value: 330000 },
  { month: "Nov", value: 420000 },
  { month: "Dec", value: 530000 },
  { month: "Jan", value: 490000 },
  { month: "Feb", value: 460000 },
];

const PERFORMANCE_DATA = [
  { name: "Kampala Nites", value: 46, color: "#F97316" },
  { name: "Esm School Manager", value: 25, color: "#7C4A1E" },
  { name: "Safe-Jaj App", value: 16, color: "#D4A574" },
  { name: "Savanna Records", value: 8, color: "#A89070" },
  { name: "Creative Class", value: 5, color: "#C4B098" },
];

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

// ─── Filter dropdown button ───────────────────────────────────────────────────

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:border-gray-300 transition-colors">
      {label} <IconChevronDown className="size-3.5 text-gray-400" />
    </button>
  );
}

// ─── Sales & Earnings Trend chart ─────────────────────────────────────────────

function SalesEarningsTrend() {
  const formatY = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return `${v}`;
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Sales & Earnings Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Is my business growing? Am I making more?
          </p>
        </div>
        <FilterButton label="Filter by date" />
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={TREND_DATA}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="vendorTrendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={formatY}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
            formatter={(v: number) => [`UGX ${v.toLocaleString()}`, "Revenue"]}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F97316"
            strokeWidth={2.5}
            fill="url(#vendorTrendGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#F97316",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Product Performance donut chart ─────────────────────────────────────────

const RADIAN = Math.PI / 180;

function ProductPerformance() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.08) return null;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="rounded-xl border bg-white p-6 flex flex-col">
      <h3 className="font-semibold text-foreground mb-1">
        Product Performance
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Which Products Are My Best Sellers?
      </p>
      <div className="border-t border-gray-100 mb-4" />

      <div className="flex justify-center mb-4">
        <PieChart width={180} height={180}>
          <Pie
            data={PERFORMANCE_DATA}
            cx={85}
            cy={85}
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {PERFORMANCE_DATA.map((entry, idx) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                opacity={activeIdx === null || activeIdx === idx ? 1 : 0.6}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {PERFORMANCE_DATA.map((entry, idx) => (
          <div
            key={entry.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground">
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Action Center table ──────────────────────────────────────────────

const productColumns: ColumnDef<ProductRow>[] = [
  {
    id: "picture",
    header: "Picture",
    cell: ({ row }) => (
      <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
        {row.original.image ? (
          <img
            src={row.original.image}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <IconPackage className="size-5 text-gray-300" />
        )}
      </div>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Product name",
    cell: ({ row }) => (
      <span className="font-medium text-sm text-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "price",
    accessorFn: (r) => r.price,
    header: "Price (Ugx)",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.price.toLocaleString()}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <ViewAction />,
  },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDashboard({ onAddProducts }: { onAddProducts?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 gap-5">
      {/* Telescope illustration */}
      <div className="relative flex items-center justify-center">
        <div className="size-56 rounded-full bg-gray-100 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="size-44" fill="none">
            {/* Stars */}
            <text x="120" y="45" fontSize="12" fill="#9ca3af">
              +
            </text>
            <text x="145" y="65" fontSize="10" fill="#9ca3af">
              +
            </text>
            <text x="65" y="155" fontSize="10" fill="#9ca3af">
              +
            </text>
            {/* Question mark ball */}
            <circle cx="85" cy="75" r="28" fill="#1a1a1a" />
            <text x="78" y="83" fontSize="24" fontWeight="bold" fill="white">
              ?
            </text>
            {/* Telescope tube */}
            <rect
              x="88"
              y="95"
              width="55"
              height="18"
              rx="4"
              fill="#d1d5db"
              transform="rotate(-30 88 95)"
            />
            <rect
              x="100"
              y="108"
              width="38"
              height="14"
              rx="3"
              fill="#9ca3af"
              transform="rotate(-30 100 108)"
            />
            {/* Eye piece */}
            <circle cx="140" cy="130" r="6" fill="#6b7280" />
            {/* Tripod legs */}
            <line
              x1="105"
              y1="138"
              x2="85"
              y2="175"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="105"
              y1="138"
              x2="118"
              y2="178"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="105"
              y1="138"
              x2="102"
              y2="178"
              stroke="#1a1a1a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Ground line */}
            <line
              x1="75"
              y1="178"
              x2="130"
              y2="178"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">
          Nothing here yet!
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs text-center">
          Your dashboard information will show here once you upload products
        </p>
      </div>

      <Button
        onClick={onAddProducts}
        className="h-12 px-10 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] text-sm"
      >
        Add products
      </Button>
    </div>
  );
}

// ─── Vendor Dashboard Page ────────────────────────────────────────────────────

export default function VendorDashboardPage() {
  const { user } = useReduxAuth();

  // Toggle this to test empty state vs populated state
  const hasProducts = MOCK_PRODUCTS.length > 0;

  const vendorName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : "World of Africa";

  const stats = hasProducts
    ? [
        {
          title: "Total Active Products",
          value: MOCK_PRODUCTS.filter((p) => p.status === "Active").length,
          icon: <IconPackage className="size-5 text-white" />,
          gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
        },
        {
          title: "Total Gross Sales",
          value: "0",
          icon: (
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          ),
          gradient: "bg-gradient-to-br from-[#c97a1a] to-[#a8610f]",
        },
        {
          title: "Total sales",
          value: "$0",
          icon: <IconCurrencyDollar className="size-5 text-white" />,
          gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
        },
      ]
    : [
        {
          title: "Total products",
          value: "0",
          icon: <IconPackage className="size-5 text-white" />,
          gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
        },
        {
          title: "Pending Approval",
          value: "0",
          icon: <IconClock className="size-5 text-white" />,
          gradient: "bg-gradient-to-br from-[#c97a1a] to-[#a8610f]",
        },
        {
          title: "Total sales",
          value: "$0",
          icon: (
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          ),
          gradient: "bg-gradient-to-br from-[#a05015] to-[#7a3a0a]",
        },
        {
          title: "Net Revenue",
          value: "$0",
          icon: <IconCurrencyDollar className="size-5 text-white" />,
          gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
        },
      ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <VendorAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
          {/* Greeting */}
          <h1 className="text-2xl font-bold text-foreground">
            {vendorName}, here&apos;s how you&apos;re moving
          </h1>

          {/* Stat cards */}
          <div
            className={cn(
              "grid gap-4",
              hasProducts
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 xl:grid-cols-4",
            )}
          >
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* ── Content: populated vs empty ── */}
          {hasProducts ? (
            <>
              {/* Charts row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                <SalesEarningsTrend />
                <ProductPerformance />
              </div>

              {/* Product Action Center */}
              <div className="rounded-xl">
                <DataTable
                  columns={productColumns}
                  data={MOCK_PRODUCTS}
                  title="Product Action Center"
                  description="What's stuck?, What do I need to fix?"
                  headerAction={
                    <div className="flex items-center gap-2">
                      <FilterButton label="Top 5 Products" />
                      <FilterButton label="Filter by date" />
                    </div>
                  }
                  // searchColumn="name"
                  // searchPlaceholder="Search"
                  showFilters
                  showSort
                  sortLabel="Price"
                  showSelection
                  showPagination={false}
                  pageSize={10}
                  emptyMessage="No products found."
                />
              </div>
            </>
          ) : (
            <EmptyDashboard
              onAddProducts={() => console.log("Navigate to add products")}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
