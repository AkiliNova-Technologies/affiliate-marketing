"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  IconArrowLeft,
  IconX,
  IconBan,
  IconPackage,
  IconClock,
  IconCurrencyDollar,
  IconClipboardList,
  IconCopy,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";
import { useReduxAdmin } from "@/hooks/useReduxAdmin";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PENDING_RE_APPROVAL"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "DELETED";

interface ApiProduct {
  id: string;
  name: string;
  category?: string | { name: string };
  subCategory?: string;
  price?: number;
  priceAmount?: number;
  currency?: string;
  affiliateCommission?: number;
  commissionRate?: number;
  status: ProductStatus | string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  details?: string[];
  salesPageUrl?: string;
  websiteUrl?: string;
  thankYouPageUrl?: string;
  vendorName?: string;
  vendor?: { businessName?: string; firstName?: string; lastName?: string };
  logs?: ProductLog[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductLog {
  id: string;
  date?: string;
  time?: string;
  createdAt?: string;
  change?: string;
  action?: string;
  userName?: string;
  userEmail?: string;
  performedBy?: { firstName?: string; lastName?: string; email?: string };
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function getProductName(p: ApiProduct): string {
  return p.name || "—";
}
function getProductPrice(p: ApiProduct): number {
  return p.price ?? p.priceAmount ?? 0;
}
function getProductCurrency(p: ApiProduct): string {
  return p.currency ?? "UGX";
}
function getProductImage(p: ApiProduct): string | undefined {
  return p.imageUrl ?? p.images?.[0];
}
function getProductCategory(p: ApiProduct): string {
  if (!p.category) return "—";
  if (typeof p.category === "string") return p.category;
  return p.category.name ?? "—";
}
function getProductCommission(p: ApiProduct): number {
  return p.affiliateCommission ?? p.commissionRate ?? 0;
}
function getProductStatus(p: ApiProduct): string {
  const map: Record<string, string> = {
    PENDING_APPROVAL: "Pending Approval",
    ACTIVE: "Active",
    PENDING_RE_APPROVAL: "Pending re-approval",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    DELETED: "Deleted",
  };
  return map[p.status?.toUpperCase?.()] ?? p.status ?? "Unknown";
}
function getLogDate(log: ProductLog): string {
  if (log.date) return log.date;
  if (log.createdAt) return new Date(log.createdAt).toLocaleDateString("en-GB");
  return "—";
}
function getLogTime(log: ProductLog): string {
  if (log.time) return log.time;
  if (log.createdAt)
    return new Date(log.createdAt).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return "—";
}
function getLogChange(log: ProductLog): string {
  return log.change ?? log.action ?? "—";
}
function getLogUser(log: ProductLog): { name: string; email: string } {
  if (log.userName) return { name: log.userName, email: log.userEmail ?? "" };
  const pb = log.performedBy;
  if (pb) {
    const name = [pb.firstName, pb.lastName].filter(Boolean).join(" ") || "—";
    return { name, email: pb.email ?? "" };
  }
  return { name: "—", email: "" };
}

// ─── Page shell ───────────────────────────────────────────────────────────────

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

// ─── Telescope empty state ────────────────────────────────────────────────────

function TelescopeEmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex flex-col items-center justify-center gap-4 p-6 h-62 w-62 border rounded-full bg-[#EFEFEF]">
        <img
          src="/emptystate.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">
            Reject this product
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </div>
        <div className="border-t border-gray-200 mt-4 mb-5" />

        {/* Body */}
        <label className="block text-sm font-semibold text-foreground">
          Reason for rejection
        </label>
        <p className="mt-0.5 text-xs text-[#F97316]">
          Provide a brief reason to why you're rejecting this product
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={9}
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
        />

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => ok && !isLoading && onConfirm(reason)}
            disabled={!ok || isLoading}
            className={cn(
              "flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white transition-all",
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
                Deactivate <IconBan className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reinstate modal ──────────────────────────────────────────────────────────

function ReinstateModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-[#fef8f0] p-10 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Illustration: box with rocket + person */}
        <div className="h-36 w-36 flex items-center justify-center mb-4">
          <svg viewBox="0 0 160 140" fill="none" className="w-full h-full">
            {/* Open box */}
            <rect
              x="25"
              y="78"
              width="60"
              height="44"
              rx="3"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <path
              d="M25 90 L55 78 L85 90"
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
            />
            {/* Rocket */}
            <ellipse
              cx="55"
              cy="62"
              rx="8"
              ry="14"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <path
              d="M47 70 L42 80 L55 75 L68 80 L63 70"
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="55"
              y1="48"
              x2="55"
              y2="52"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            {/* Person */}
            <circle cx="115" cy="50" r="12" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M115 62 L115 95" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M115 72 L100 62" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M115 74 L130 65" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M115 95 L105 113" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M115 95 L125 113" stroke="#1a1a1a" strokeWidth="2" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-foreground">
          Reinstate this product?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It will become Active immediately.
        </p>

        <div className="mt-8 flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-md border border-gray-300 text-sm font-semibold text-foreground bg-white hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-md bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner /> Reinstating…
              </>
            ) : (
              "Confirm"
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
  onActionComplete,
}: {
  product: ApiProduct;
  onBack: () => void;
  onActionComplete: (message: string, subtitle: string) => void;
}) {
  const {
    loadProductById,
    selectedProduct,
    approveProductById,
    rejectProductById,
    suspendProductById,
    reactivateProductById,
    productsActionLoading,
    productsLoading,
  } = useReduxAdmin();

  const [activeTab, setActiveTab] = useState<ProductTab>("live");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  useEffect(() => {
    loadProductById(product.id);
  }, [product.id, loadProductById]);

  const p: ApiProduct = (selectedProduct as ApiProduct) ?? product;
  const rawStatus = (p.status ?? "").toUpperCase();
  const displayStatus = getProductStatus(p);
  const isPendingApproval = rawStatus === "PENDING_APPROVAL";
  const isPendingReApproval = rawStatus === "PENDING_RE_APPROVAL";
  const isActive = rawStatus === "ACTIVE";
  const isSuspended = rawStatus === "SUSPENDED";
  const isDeactivated = rawStatus === "DEACTIVATED";

  const copyToClipboard = (text: string) =>
    navigator.clipboard.writeText(text).catch(() => {});

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApprove = async () => {
    setShowStatusDropdown(false);
    try {
      await approveProductById(p.id);
      setNotification({
        message: "This product has been approved",
        subtitle: `${getProductName(p)} is now active!`,
      });
      onActionComplete(
        "The Product is now active",
        `${getProductName(p)} is now an active product in the marketplace`,
      );
    } catch {
      /* toasted inside hook */
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectProductById(p.id, reason);
      setShowRejectModal(false);
      setNotification({
        message: "This product has been rejected",
        subtitle: "An email with the reason has been sent to the vendor",
      });
      onActionComplete(
        "Product rejected",
        "The vendor has been notified by email",
      );
    } catch {
      /* toasted inside hook */
    }
  };

  const handleSuspend = async () => {
    setShowStatusDropdown(false);
    try {
      await suspendProductById(p.id);
      setNotification({
        message: "This product has been Suspended",
        subtitle: `${getProductName(p)} is no longer active!`,
      });
      onActionComplete(
        "Product suspended",
        `${getProductName(p)} has been suspended`,
      );
    } catch {
      /* toasted inside hook */
    }
  };

  const handleReinstateConfirm = async () => {
    try {
      await reactivateProductById(p.id);
      setShowReinstateModal(false);
      setNotification({
        message: "This product has been reactivated",
        subtitle: `${getProductName(p)} is now active again`,
      });
      onActionComplete(
        "Product reactivated",
        `${getProductName(p)} is now active`,
      );
    } catch {
      /* toasted inside hook */
    }
  };

  // ── Tab edit icon ─────────────────────────────────────────────────────────

  const EditIcon = () => (
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
  );

  // ── Product content (shared between live & pending tabs) ───────────────────

  const salesUrl = p.salesPageUrl ?? p.websiteUrl;
  const thankYouUrl = p.thankYouPageUrl;

  const ProductContent = () => (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-0">
        {/* Left: image + price/commission */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center">
            {getProductImage(p) ? (
              <img
                src={getProductImage(p)}
                alt={getProductName(p)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <IconPackage className="size-12" />
                <span className="text-sm">No image</span>
              </div>
            )}
          </div>
          {p.images && p.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {p.images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="size-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-xl font-bold text-foreground">
                {getProductCurrency(p)} {getProductPrice(p).toLocaleString()}
              </p>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <p className="text-xs text-muted-foreground mb-1">
                Affiliate Commission
              </p>
              <p className="text-xl font-bold text-foreground">
                {getProductCommission(p)}%
              </p>
            </div>
          </div>
        </div>

        {/* Right: description + details */}
        <div>
          {p.description && (
            <>
              <h3 className="text-base font-bold text-foreground mb-3">
                Product description
              </h3>
              <div className="space-y-3 mb-5">
                {p.description.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </>
          )}
          {p.details && p.details.length > 0 && (
            <>
              <h3 className="text-base font-bold text-foreground mb-3">
                Product details
              </h3>
              <ul className="space-y-1.5">
                {p.details.map((d, i) => (
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

      {/* URLs — below the grid, full width, separated by a border */}
      {(salesUrl || thankYouUrl) && (
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "Sales Page URL", url: salesUrl },
            { label: "Thank You Page URL", url: thankYouUrl },
          ].map(({ label, url }, i) => (
            <div
              key={label}
              className={cn(
                i === 0 && "sm:border-r sm:border-gray-100 sm:pr-5",
              )}
            >
              <p className="text-sm text-muted-foreground mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline truncate flex-1"
                >
                  {url || "—"}
                </a>
                <button
                  onClick={() => copyToClipboard(url || "")}
                  className="shrink-0 flex items-center gap-1 rounded-md bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
                >
                  Copy <IconCopy className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        {/* ← Products page title */}
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
        </div>

        {/* Product header: name / category / status */}
        <div className="mb-4 rounded-xl border bg-white px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              {getProductName(p)}
              {productsLoading && (
                <IconRefresh className="size-3.5 text-muted-foreground animate-spin" />
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getProductCategory(p)}
              {p.subCategory ? ` / ${p.subCategory}` : ""}
            </p>
          </div>
          <StatusBadge status={displayStatus} />
        </div>

        {/* Notification banner */}
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

        {/* Tabs — always shown on all statuses */}
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
              icon: <EditIcon />,
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
                "flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors border",
                activeTab === key
                  ? "bg-white text-foreground border-gray-200 shadow-sm font-semibold"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/60",
              )}
            >
              <span
                className={cn(
                  activeTab === key
                    ? "text-[#F97316]"
                    : "text-muted-foreground",
                )}
              >
                {icon}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {/* Live product details */}
          {activeTab === "live" && (
            <div className="rounded-xl border bg-white p-6">
              <ProductContent />
            </div>
          )}

          {/* Pending edits — show content if PENDING_RE_APPROVAL, else empty state */}
          {activeTab === "pending" &&
            (isPendingReApproval ? (
              <div className="rounded-xl border bg-white p-6">
                <ProductContent />
              </div>
            ) : (
              <TelescopeEmptyState
                title="No Pending Edits here!"
                subtitle="Edits will appear here when submitted"
              />
            ))}

          {/* Product logs */}
          {activeTab === "logs" &&
            ((p.logs ?? []).length === 0 ? (
              <TelescopeEmptyState
                title="No logs yet!"
                subtitle="Activity logs will appear here"
              />
            ) : (
              <div className="rounded-xl border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/60">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Change Made
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(p.logs ?? []).map((log) => {
                      const { name, email } = getLogUser(log);
                      return (
                        <tr
                          key={log.id}
                          className="border-b last:border-0 hover:bg-gray-50/40"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm text-foreground">
                              {getLogDate(log)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getLogTime(log)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {getLogChange(log)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-foreground">
                              {name}
                            </p>
                            <p className="text-xs text-[#F97316]">{email}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
        </div>

        {/* Change Status — bottom right, opens upward */}
        {(isPendingApproval ||
          isPendingReApproval ||
          isActive ||
          isSuspended ||
          isDeactivated) && (
          <div className="mt-6 flex justify-end">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={productsActionLoading}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors shadow-sm disabled:opacity-60 min-w-[160px]"
              >
                {productsActionLoading ? (
                  <>
                    <Spinner /> Updating…
                  </>
                ) : (
                  <>
                    <span>Change Status</span>
                    <span className="text-gray-400 text-xs">▾</span>
                  </>
                )}
              </button>

              {showStatusDropdown && !productsActionLoading && (
                <div className="absolute bottom-full right-0 mb-1 w-52 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden z-10">
                  {(isPendingApproval || isPendingReApproval) && (
                    <button
                      onClick={handleApprove}
                      className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      Approve Product
                    </button>
                  )}
                  {(isPendingApproval || isPendingReApproval || isActive) && (
                    <button
                      onClick={() => {
                        setShowStatusDropdown(false);
                        setShowRejectModal(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      Reject Product
                    </button>
                  )}
                  {isActive && (
                    <button
                      onClick={handleSuspend}
                      className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      Suspend product
                    </button>
                  )}
                  {(isSuspended || isDeactivated) && (
                    <button
                      onClick={() => {
                        setShowStatusDropdown(false);
                        setShowReinstateModal(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      Reinstate Product
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
          onConfirm={handleReject}
          isLoading={productsActionLoading}
        />
      )}
      {showReinstateModal && (
        <ReinstateModal
          onClose={() => setShowReinstateModal(false)}
          onConfirm={handleReinstateConfirm}
          isLoading={productsActionLoading}
        />
      )}
    </PageShell>
  );
}

// ─── Products list page ───────────────────────────────────────────────────────

const PAGE_SIZE = 20;

function ProductsListPage({
  onViewProduct,
  banner,
  onDismissBanner,
}: {
  onViewProduct: (p: ApiProduct) => void;
  banner: { message: string; subtitle: string } | null;
  onDismissBanner: () => void;
}) {
  const {
    productQueue,
    productsLoading,
    productsError,
    productsTotal,
    loadProductQueue,
  } = useReduxAdmin();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadProductQueue({ page: currentPage, limit: PAGE_SIZE });
  }, [currentPage, loadProductQueue]);

  const products = productQueue as ApiProduct[];

  const pendingApprovalCount = products.filter(
    (p) => (p.status ?? "").toUpperCase() === "PENDING_APPROVAL",
  ).length;
  const pendingReApprovalCount = products.filter(
    (p) => (p.status ?? "").toUpperCase() === "PENDING_RE_APPROVAL",
  ).length;

  const columns: ColumnDef<ApiProduct>[] = [
    {
      id: "picture",
      header: "Picture",
      cell: ({ row }) => (
        <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
          {getProductImage(row.original) ? (
            <img
              src={getProductImage(row.original)}
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
      accessorFn: (p) => getProductName(p),
      header: "Product name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {getProductName(row.original)}
        </span>
      ),
    },
    {
      id: "price",
      accessorFn: (p) => getProductPrice(p),
      header: "Price (Ugx)",
      cell: ({ row }) => (
        <span className="text-foreground">
          {getProductPrice(row.original).toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (p) => getProductStatus(p),
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={getProductStatus(row.original)} />
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

  // Stat cards match the design: Total, Pending approval, Pending re-approval, Net Revenue
  const stats = [
    {
      title: "Total products",
      value: productsTotal ?? 0,
      change: "+15%",
      icon: <IconPackage className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Pending approval",
      value: pendingApprovalCount,
      change: "+5%",
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Pending re-approval",
      value: pendingReApprovalCount,
      change: "+10%",
      icon: <IconRefresh className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: "$0",
      change: "+12%",
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

        {/* Action banner */}
        {banner && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border-l-4 border-l-blue-500 border border-blue-100 bg-blue-50 px-5 py-4">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900">
                {banner.message}
              </p>
              <p className="mt-0.5 text-xs text-blue-700">{banner.subtitle}</p>
            </div>
            <button
              onClick={onDismissBanner}
              className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* Error banner */}
        {productsError && (
          <div className="mb-5 flex items-start gap-3 rounded-md border-l-4 border-l-red-500 border border-red-100 bg-red-50 px-5 py-4">
            <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                {productsError}
              </p>
            </div>
            <button
              onClick={() =>
                loadProductQueue({ page: currentPage, limit: PAGE_SIZE })
              }
              className="shrink-0 text-xs font-semibold text-red-600 underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* DataTable */}
        <div className="rounded-xl">
          <DataTable
            columns={columns}
            data={products}
            loading={productsLoading}
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
            total={productsTotal ?? 0}
            page={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            emptyState={
              <TelescopeEmptyState
                title="Nothing here yet!"
                subtitle="Once vendors start adding products, they will appear here."
              />
            }
          />
        </div>
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "detail";

export default function AdminProductsPage() {
  const [view, setView] = useState<View>("list");
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(
    null,
  );
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  const { deselectProduct } = useReduxAdmin();

  const handleViewProduct = useCallback((product: ApiProduct) => {
    setSelectedProduct(product);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    deselectProduct();
    setSelectedProduct(null);
    setView("list");
  }, [deselectProduct]);

  const handleActionComplete = useCallback(
    (message: string, subtitle: string) => {
      setBanner({ message, subtitle });
      handleBack();
    },
    [handleBack],
  );

  if (view === "detail" && selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onBack={handleBack}
        onActionComplete={handleActionComplete}
      />
    );
  }

  return (
    <ProductsListPage
      onViewProduct={handleViewProduct}
      banner={banner}
      onDismissBanner={() => setBanner(null)}
    />
  );
}
