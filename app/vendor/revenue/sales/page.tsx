"use client";

import * as React from "react";
import { useState } from "react";
import {
  IconArrowLeft,
  IconX,
  IconChevronUp,
  IconChevronDown,
  IconCurrencyDollar,
  IconChartBar,
  IconPackage,
  IconBolt,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SaleRecord {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  grossAmount: string;
  yourPayout: string;
  transactionDate: string;
}

type DatePreset = "today" | "last7" | "last30" | "thisMonth" | "allTime" | "custom";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SALES: SaleRecord[] = [
  { orderId: "SW0049", customerName: "Raymond Mwirima",  customerEmail: "raymuh@gmail.com",      productName: "Kampala Niles App",       grossAmount: "$400",    yourPayout: "$330",    transactionDate: "11/05/2026" },
  { orderId: "SW0049", customerName: "Albert Wacuka",    customerEmail: "alberto@email.com",     productName: "The Night I fell in Love", grossAmount: "$5,400",  yourPayout: "$4,400",  transactionDate: "11/05/2026" },
  { orderId: "SW0049", customerName: "Assimwe Racheal",  customerEmail: "assrae@email.com",      productName: "Kavuma's Creative Class",  grossAmount: "$6,400",  yourPayout: "$5,400",  transactionDate: "11/05/2026" },
  { orderId: "SW0049", customerName: "Innocent Ademon",  customerEmail: "innocentman@email.com", productName: "Wedding Photography",      grossAmount: "$500",    yourPayout: "$450",    transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Muthoni Angella",  customerEmail: "angella@email.com",     productName: "Safe-jaj app",             grossAmount: "$5,400",  yourPayout: "$6,400",  transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Webina Lawson",    customerEmail: "law@email.com",         productName: "Betrayed by my leader",    grossAmount: "$5,460",  yourPayout: "$7,460",  transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Khalid Aucho",     customerEmail: "kkau@email.com",        productName: "ESM School Manager",       grossAmount: "$2,00",   yourPayout: "$189",    transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Quincy Maine",     customerEmail: "qmain@email.com",       productName: "Savanna Records",          grossAmount: "$4,00",   yourPayout: "$300",    transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Yvette Mandela",   customerEmail: "yvyyvy@email.com",      productName: "Chimpman Deliveries",      grossAmount: "$55,600", yourPayout: "$45,600", transactionDate: "10/05/2026" },
  { orderId: "SW0049", customerName: "Mulutta Peter",    customerEmail: "mumupeter@email.com",   productName: "Lawya Lens Consultancy",   grossAmount: "$2,400",  yourPayout: "$2,400",  transactionDate: "10/05/2026" },
];

// ─── Sales stat cards (mirrors section-cards.tsx StatCard pattern) ────────────

interface SalesStatCard {
  title: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
}

const SALES_STAT_CARDS: SalesStatCard[] = [
  {
    title: "Net Earnings",
    value: "$450K",
    icon: IconCurrencyDollar,
    gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
  },
  {
    title: "Total Gross Sales",
    value: "$630K",
    icon: IconChartBar,
    gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
  },
  {
    title: "Commission Paid",
    value: "$130K",
    icon: IconPackage,
    gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
  },
  {
    title: "Active Products",
    value: "40",
    icon: IconBolt,
    gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
  },
];

function SalesStatCardItem({ card }: { card: SalesStatCard }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gradient-to-br p-5 text-white shadow-sm",
        card.gradient
      )}
    >
      {/* Decorative wave lines — exact same as section-cards.tsx */}
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
            <div className="rounded-lg p-2 bg-white/20">
              <card.icon className="size-5 text-white" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesSectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {SALES_STAT_CARDS.map((card) => (
        <SalesStatCardItem key={card.title} card={card} />
      ))}
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

const SALES_COLUMNS: ColumnDef<SaleRecord, unknown>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.orderId}</span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{row.original.customerName}</span>
        <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
      </div>
    ),
  },
  {
    accessorKey: "productName",
    header: "Product name",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.productName}</span>
    ),
  },
  {
    accessorKey: "grossAmount",
    header: "Gross Amount",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.grossAmount}</span>
    ),
  },
  {
    accessorKey: "yourPayout",
    header: "Your Payout",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.yourPayout}</span>
    ),
  },
  {
    accessorKey: "transactionDate",
    header: "Transaction Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.transactionDate}</span>
    ),
  },
];

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const DAY_NAMES = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun … convert to Mon-based (0=Mon)
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

interface CalendarProps {
  year: number;
  month: number;
  selected?: Date | null;
  onSelect?: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  today?: Date;
}

function Calendar({ year, month, selected, onSelect, onPrevMonth, onNextMonth, today = new Date() }: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);

  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, currentMonth: false });
  }

  const isToday = (d: number) =>
    today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  const isSelected = (d: number) =>
    selected instanceof Date &&
    selected.getDate() === d &&
    selected.getMonth() === month &&
    selected.getFullYear() === year;

  return (
    <div className="min-w-[260px]">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onPrevMonth} className="flex size-6 items-center justify-center rounded hover:bg-gray-100 transition-colors">
            <IconChevronUp className="size-3.5 text-gray-500" />
          </button>
          <button onClick={onNextMonth} className="flex size-6 items-center justify-center rounded hover:bg-gray-100 transition-colors">
            <IconChevronDown className="size-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => (
          <button
            key={idx}
            disabled={!cell.currentMonth}
            onClick={() => cell.currentMonth && onSelect?.(new Date(year, month, cell.day))}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-sm transition-colors mx-auto",
              !cell.currentMonth && "text-gray-300 cursor-default",
              cell.currentMonth && !isToday(cell.day) && !isSelected(cell.day) && "text-foreground hover:bg-gray-100",
              isToday(cell.day) && !isSelected(cell.day) && "text-[#F97316] font-semibold",
              isSelected(cell.day) && "bg-[#F97316] text-white font-semibold",
            )}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Date Selector Modal (single calendar) ────────────────────────────────────

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today",     label: "Today" },
  { key: "last7",     label: "last 7 days" },
  { key: "last30",    label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "allTime",   label: "All time" },
  { key: "custom",    label: "Custom range" },
];

function DateSelectorModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (label: string) => void;
}) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<DatePreset | null>(null);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handlePreset = (key: DatePreset) => {
    setActivePreset(key);
    if (key === "custom") return; // handled by switching to dual-calendar modal
    setSelected(null);
  };

  const handleApply = () => {
    if (activePreset === "custom") return;
    const label = activePreset
      ? PRESETS.find(p => p.key === activePreset)?.label ?? "Selected"
      : selected
        ? `${selected.getDate()}/${selected.getMonth() + 1}/${selected.getFullYear()}`
        : "Selected";
    onApply(label);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Select date</h2>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors">
            <IconX className="size-4" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Presets */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={cn(
                  "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activePreset === p.key
                    ? "bg-gray-100 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <Calendar
            year={calYear}
            month={calMonth}
            selected={selected}
            onSelect={(d) => { setSelected(d); setActivePreset(null); }}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-foreground hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 rounded-lg bg-[#F97316] py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Date Range Modal (dual calendar) ──────────────────────────────────

function CustomRangeModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (label: string) => void;
}) {
  const now = new Date();
  const [fromYear, setFromYear] = useState(now.getFullYear());
  const [fromMonth, setFromMonth] = useState(now.getMonth());
  const [toYear, setToYear] = useState(now.getFullYear());
  const [toMonth, setToMonth] = useState(now.getMonth());
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<DatePreset | null>(null);

  const prevFromMonth = () => {
    if (fromMonth === 0) { setFromYear(y => y - 1); setFromMonth(11); }
    else setFromMonth(m => m - 1);
  };
  const nextFromMonth = () => {
    if (fromMonth === 11) { setFromYear(y => y + 1); setFromMonth(0); }
    else setFromMonth(m => m + 1);
  };
  const prevToMonth = () => {
    if (toMonth === 0) { setToYear(y => y - 1); setToMonth(11); }
    else setToMonth(m => m - 1);
  };
  const nextToMonth = () => {
    if (toMonth === 11) { setToYear(y => y + 1); setToMonth(0); }
    else setToMonth(m => m + 1);
  };

  const formatDate = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  const handleApply = () => {
    if (fromDate && toDate) {
      onApply(`${formatDate(fromDate)} - ${formatDate(toDate)}`);
    } else if (activePreset) {
      onApply(PRESETS.find(p => p.key === activePreset)?.label ?? "Selected");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-[820px] rounded-2xl bg-white shadow-2xl p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Set custom date range</h2>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors">
            <IconX className="size-4" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Presets */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePreset(p.key)}
                className={cn(
                  "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activePreset === p.key
                    ? "bg-gray-100 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dual calendars */}
          <div className="flex gap-8 flex-1">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-3">From:</p>
              <Calendar
                year={fromYear}
                month={fromMonth}
                selected={fromDate}
                onSelect={setFromDate}
                onPrevMonth={prevFromMonth}
                onNextMonth={nextFromMonth}
              />
            </div>
            <div className="w-px bg-gray-100 self-stretch" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-3">To:</p>
              <Calendar
                year={toYear}
                month={toMonth}
                selected={toDate}
                onSelect={setToDate}
                onPrevMonth={prevToMonth}
                onNextMonth={nextToMonth}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="min-w-[120px] rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-foreground hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="min-w-[120px] rounded-lg bg-[#F97316] py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSalesPage() {
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [dateLabel, setDateLabel] = useState("1/05/2026 - 11/05/2026");

  const handleDateApply = (label: string) => {
    if (label === "Custom range") {
      setShowDateModal(false);
      setShowCustomRangeModal(true);
      return;
    }
    setDateLabel(label);
    setShowDateModal(false);
  };

  const handleCustomRangeApply = (label: string) => {
    setDateLabel(label);
    setShowCustomRangeModal(false);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <VendorAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

          {/* Page title */}
          <div className="flex items-center gap-3 mb-5">
            <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          </div>

          {/* Stat cards */}
          <div className="mb-6">
            <SalesSectionCards />
          </div>

          {/* Sales table */}
          <DataTable
            columns={SALES_COLUMNS}
            data={MOCK_SALES}
            searchColumn="customerName"
            searchPlaceholder="Search"
            showFilters
            showSort
            showSelection={false}
            showPagination
            pageSize={10}
          />
        </div>
      </SidebarInset>

      {/* Date selector modal */}
      {showDateModal && (
        <DateSelectorModal
          onClose={() => setShowDateModal(false)}
          onApply={handleDateApply}
        />
      )}

      {/* Custom date range modal */}
      {showCustomRangeModal && (
        <CustomRangeModal
          onClose={() => setShowCustomRangeModal(false)}
          onApply={handleCustomRangeApply}
        />
      )}
    </SidebarProvider>
  );
}