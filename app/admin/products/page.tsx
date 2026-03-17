"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import {
  IconArrowLeft,
  IconX,
  IconBan,
  IconCurrencyDollar,
  IconPackage,
  IconClock,
  IconTrendingUp,
  IconClipboardList,
  IconCopy,
  IconExternalLink,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PENDING_RE_APPROVAL"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "DELETED";

type DisplayProductStatus =
  | "Pending Approval"
  | "Active"
  | "Pending re-approval"
  | "Suspended"
  | "Deactivated"
  | "Deleted";

interface ProductLog {
  id: string;
  date: string;
  time: string;
  change: string;
  userName: string;
  userEmail: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  currency: string;
  affiliateCommission: number;
  status: ProductStatus;
  image?: string;
  images?: string[];
  description?: string;
  details?: string[];
  salesPageUrl?: string;
  thankYouPageUrl?: string;
  vendorName?: string;
  logs?: ProductLog[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function toDisplayStatus(status: ProductStatus): DisplayProductStatus {
  const map: Record<ProductStatus, DisplayProductStatus> = {
    PENDING_APPROVAL: "Pending Approval",
    ACTIVE: "Active",
    PENDING_RE_APPROVAL: "Pending re-approval",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    DELETED: "Deleted",
  };
  return map[status] ?? "Pending Approval";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kampala Niles App",
    category: "Software & Apps",
    subCategory: "Mobile Apps",
    price: 12000,
    currency: "UGX",
    affiliateCommission: 20,
    status: "PENDING_APPROVAL",
    description:
      "Kampala Nites App is a nightlife tracking and discovery platform that helps users explore events, clubs, lounges, and entertainment spots across Kampala in real time.\n\nDesigned for nightlife enthusiasts, event organizers, and venue owners, Kampala Nites App centralizes nightlife information into one accessible digital platform.",
    details: [
      "Real-time nightlife activity tracking",
      "Event discovery and listings",
      "Venue profiles with ratings and reviews",
      "Push notifications for upcoming events",
      "Location-based recommendations",
      "User favorites & saved events",
      "Organizer and venue dashboard access",
    ],
    salesPageUrl: "https://www.example.com/folder/page.htm",
    thankYouPageUrl: "https://www.example.com/folder/page.htm",
    logs: [
      {
        id: "l1",
        date: "29/05/2025",
        time: "9:0am",
        change: "Approved Product",
        userName: "John Smith",
        userEmail: "johns@tekjuice.co.uk",
      },
      {
        id: "l2",
        date: "19/05/2025",
        time: "8:00am",
        change: "Rejected Product",
        userName: "Labella Wilson",
        userEmail: "wilson@gmail.com",
      },
    ],
  },
  {
    id: "2",
    name: "The Night I fell in Love-ebook",
    category: "eBooks",
    price: 1200000,
    currency: "UGX",
    affiliateCommission: 15,
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Kavuma's Creative Class",
    category: "Courses",
    price: 400000,
    currency: "UGX",
    affiliateCommission: 10,
    status: "DELETED",
  },
  {
    id: "4",
    name: "Wedding Photography",
    category: "Services & Consulting",
    price: 50000,
    currency: "UGX",
    affiliateCommission: 10,
    status: "PENDING_RE_APPROVAL",
    description:
      "Capture your most cherished moments with our professional Wedding Photography service.\n\nFrom the quiet anticipation before the ceremony to the joyful celebration at the reception, every smile, glance, and detail is documented with precision and creativity.",
    details: [
      "Pre-wedding consultation and planning",
      "Full-day event coverage",
      "Professional editing and color correction",
      "High-resolution digital gallery",
      "Optional printed albums and framed portraits",
    ],
    salesPageUrl: "https://www.example.com/folder/page.htm",
    thankYouPageUrl: "https://www.example.com/folder/page.htm",
    logs: [
      {
        id: "l1",
        date: "29/05/2025",
        time: "9:0am",
        change: "Approved Product",
        userName: "John Smith",
        userEmail: "johns@tekjuice.co.uk",
      },
      {
        id: "l2",
        date: "19/05/2025",
        time: "8:00am",
        change: "Rejected Product",
        userName: "Labella Wilson",
        userEmail: "wilson@gmail.com",
      },
      {
        id: "l3",
        date: "09/05/2025",
        time: "9:40am",
        change: "Rejected Product",
        userName: "Asiimwe Godwin",
        userEmail: "ass345@gmail",
      },
      {
        id: "l4",
        date: "09/05/2022",
        time: "9:00am",
        change: "Rejected Product",
        userName: "Innocent Ademon",
        userEmail: "innde@gmail.com",
      },
      {
        id: "l5",
        date: "09/05/2022",
        time: "8:00am",
        change: "Rejected Product",
        userName: "Muthoni Angella",
        userEmail: "mutngella@gmail.com",
      },
    ],
  },
  {
    id: "5",
    name: "Safe-jaj app",
    category: "Software & Apps",
    price: 10000,
    currency: "UGX",
    affiliateCommission: 12,
    status: "SUSPENDED",
  },
  {
    id: "6",
    name: "Betrayed by my leader - ebook",
    category: "eBooks",
    price: 300000,
    currency: "UGX",
    affiliateCommission: 8,
    status: "DEACTIVATED",
  },
  {
    id: "7",
    name: "ESM School Manager",
    category: "Software & Apps",
    price: 800000,
    currency: "UGX",
    affiliateCommission: 18,
    status: "DELETED",
  },
  {
    id: "8",
    name: "Savanna Records",
    category: "Music",
    price: 100000,
    currency: "UGX",
    affiliateCommission: 25,
    status: "ACTIVE",
  },
  {
    id: "9",
    name: "Chimpman Deliveries",
    category: "Services & Consulting",
    price: 250000,
    currency: "UGX",
    affiliateCommission: 10,
    status: "SUSPENDED",
  },
  {
    id: "10",
    name: "Lawya Lens Consultancy",
    category: "Services & Consulting",
    price: 300000,
    currency: "UGX",
    affiliateCommission: 10,
    status: "DEACTIVATED",
  },
];

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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyProductsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="flex flex-col items-center justify-center gap-4 p-6 h-48 w-48 border rounded-full bg-[#EFEFEF]">
        <img
          src="/emptystate.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        No products yet!
      </h3>
      <p className="text-sm text-muted-foreground">
        Products submitted by vendors will appear here
      </p>
    </div>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

function RejectModal({
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
      <div className="w-full max-w-[620px] rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-3 pb-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-foreground">
            Do you reject this product?
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
            Reason for rejection
          </label>
          <p className="mt-0.5 text-xs text-[#F97316]">
            Provide a brief reason to why you're rejecting this product
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={8}
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
                <Spinner /> Rejecting…
              </>
            ) : (
              <>
                Reject Product <IconBan className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product detail view ──────────────────────────────────────────────────────

type ProductTab = "live" | "pending" | "logs";

function ProductDetailView({
  product,
  onBack,
  onStatusChange,
}: {
  product: Product;
  onBack: () => void;
  onStatusChange: (
    productId: string,
    newStatus: ProductStatus,
    reason?: string,
  ) => void;
}) {
  const [activeTab, setActiveTab] = useState<ProductTab>("live");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "rejected";
    message: string;
    subtitle: string;
  } | null>(null);

  const displayStatus = toDisplayStatus(product.status);
  const isPendingApproval = product.status === "PENDING_APPROVAL";
  const isPendingReApproval = product.status === "PENDING_RE_APPROVAL";
  const isActive = product.status === "ACTIVE";
  const hasPendingEdits = isPendingReApproval;

  const handleStatusAction = async (
    action: "approve" | "reject",
    reason?: string,
  ) => {
    setActionLoading(true);
    setShowStatusDropdown(false);
    await new Promise((r) => setTimeout(r, 800));
    if (action === "approve") {
      onStatusChange(product.id, "ACTIVE");
      setNotification({
        type: "success",
        message: "This product has been approved",
        subtitle: `${product.name} is now active!`,
      });
    } else {
      onStatusChange(product.id, "PENDING_RE_APPROVAL", reason);
      setNotification({
        type: "rejected",
        message: "This product has been rejected",
        subtitle:
          "An email with a reason to rejection has been sent to the vendor",
      });
      setShowRejectModal(false);
    }
    setActionLoading(false);
  };

  const copyToClipboard = (text: string) =>
    navigator.clipboard.writeText(text).catch(() => {});

  const productContent = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <IconPackage className="size-12" />
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>
        {product.images && product.images.length > 0 && (
          <div className="mt-2 flex gap-2">
            {product.images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="size-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-xl font-bold text-foreground">
              {product.currency} {product.price.toLocaleString()}
            </p>
          </div>
          <div className="border-l border-gray-100 pl-4">
            <p className="text-xs text-muted-foreground mb-1">
              Affiliate Commission
            </p>
            <p className="text-xl font-bold text-foreground">
              {product.affiliateCommission}%
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-foreground mb-3">
          Product description
        </h3>
        {product.description ? (
          <div className="space-y-3">
            {product.description.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No description provided.
          </p>
        )}
        {product.details && product.details.length > 0 && (
          <>
            <h3 className="text-base font-bold text-foreground mt-5 mb-3">
              Product details
            </h3>
            <ul className="space-y-1.5">
              {product.details.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 rounded-full bg-gray-400 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );

  const urlSection = (showCopy: boolean) => (
    <div className="mt-4 rounded-xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { label: "Sales Page URL", url: product.salesPageUrl },
        { label: "Thank You Page URL", url: product.thankYouPageUrl },
      ].map(({ label, url }, i) => (
        <div
          key={label}
          className={cn(i === 0 && "sm:border-r sm:border-gray-100 sm:pr-4")}
        >
          <p className="text-xs text-muted-foreground mb-1.5">
            {label} {showCopy && <span className="text-red-500">*</span>}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={url}
              className="text-xs text-blue-600 underline truncate flex-1"
            >
              {url}
            </a>
            {showCopy ? (
              <button
                onClick={() => copyToClipboard(url || "")}
                className="shrink-0 flex items-center gap-1 rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
              >
                Copy <IconCopy className="size-3" />
              </button>
            ) : (
              <button className="shrink-0 flex items-center gap-1 rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F97316]/90 transition-colors">
                Visit <IconExternalLink className="size-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {product.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {product.category}
                {product.subCategory ? ` / ${product.subCategory}` : ""}
              </p>
            </div>
          </div>
          <StatusBadge status={displayStatus} />
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 border-l-4 border-l-blue-500 bg-blue-50 px-5 py-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 size-5 shrink-0 text-blue-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                {notification.message}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {notification.subtitle}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* Tabs (pending re-approval only) */}
        {hasPendingEdits && (
          <div className="mb-4 flex items-center gap-1">
            {[
              {
                key: "live" as ProductTab,
                label: "Live product details",
                icon: <IconPackage className="size-3.5" />,
              },
              {
                key: "pending" as ProductTab,
                label: "Pending edits",
                icon: (
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
              },
              {
                key: "logs" as ProductTab,
                label: "Product Logs",
                icon: <IconClipboardList className="size-3.5" />,
              },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {activeTab === "logs" ? (
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                      Change Made
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(product.logs || []).map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-muted/10"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{log.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.time}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {log.change}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">
                          {log.userName}
                        </p>
                        <p className="text-xs text-[#F97316]">
                          {log.userEmail}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-6">
              {productContent}
              {(product.salesPageUrl || product.thankYouPageUrl) &&
                urlSection(activeTab === "pending")}
            </div>
          )}
        </div>

        {/* Change Status */}
        {(isPendingApproval || isPendingReApproval || isActive) && (
          <div className="mt-4 flex justify-end">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors shadow-sm"
              >
                {actionLoading ? (
                  <>
                    <Spinner /> Updating…
                  </>
                ) : (
                  <>
                    Change Status <span className="ml-1">▾</span>
                  </>
                )}
              </button>
              {showStatusDropdown && (
                <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-10">
                  {(isPendingApproval || isPendingReApproval) && (
                    <>
                      <button
                        onClick={() => {
                          setShowStatusDropdown(false);
                          handleStatusAction("approve");
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/20 transition-colors"
                      >
                        Approve Product
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusDropdown(false);
                          setShowRejectModal(true);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/20 transition-colors"
                      >
                        Reject Product
                      </button>
                    </>
                  )}
                  {isActive && (
                    <button
                      onClick={() => {
                        setShowStatusDropdown(false);
                        setShowRejectModal(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Reject Product
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onConfirm={(reason) => handleStatusAction("reject", reason)}
          isLoading={actionLoading}
        />
      )}
    </PageShell>
  );
}

// ─── Products list page ───────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function ProductsListPage({
  onViewProduct,
}: {
  onViewProduct: (product: Product) => void;
}) {
  const [loading] = useState(false);

  // ── Column definitions ────────────────────────────────────────────────────
  const columns: ColumnDef<Product>[] = [
    {
      id: "picture",
      header: "Picture",
      cell: ({ row }) => (
        <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
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
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      id: "price",
      accessorFn: (p) => p.price,
      header: "Price (Ugx)",
      cell: ({ row }) => (
        <span className="text-foreground">
          {row.original.price.toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (p) => p.status,
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={toDisplayStatus(row.original.status)} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ViewAction onClick={() => onViewProduct(row.original)} />
      ),
    },
  ];

  const stats = [
    {
      title: "Total products",
      value: "2,000",
      change: "+15%",
      icon: <IconPackage className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Pending Approval",
      value: "40",
      change: "+5%",
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Total sales",
      value: "40",
      change: "+5%",
      icon: <IconTrendingUp className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: "40",
      change: "+5%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
        <h1 className="mb-5 text-2xl font-bold text-foreground">Products</h1>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* ── DataTable ── */}
        <div className="rounded-xl">
          <DataTable
            columns={columns}
            data={MOCK_PRODUCTS}
            loading={loading}
            skeletonRows={8}
            title="All Products"
            description="Manage and monitor all products on the platform"
            searchColumn="name"
            searchPlaceholder="Search"
            showFilters
            showSort
            sortLabel="Ascending"
            showSelection
            showPagination
            pageSize={PAGE_SIZE}
            emptyState={<EmptyProductsState />}
          />
        </div>
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "detail";

export default function ProductsPage() {
  const [view, setView] = useState<View>("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setView("detail");
  }, []);

  const handleStatusChange = useCallback(
    (productId: string, newStatus: ProductStatus, _reason?: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)),
      );
      setSelectedProduct((prev) =>
        prev?.id === productId ? { ...prev, status: newStatus } : prev,
      );
    },
    [],
  );

  if (view === "detail" && selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onBack={() => setView("list")}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return <ProductsListPage onViewProduct={handleViewProduct} />;
}
