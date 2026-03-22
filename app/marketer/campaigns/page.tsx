"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconArrowDown,
  IconEye,
  IconLayoutGrid,
  IconLayoutList,
  IconClick,
  IconShoppingCart,
  IconCurrencyDollar,
  IconArrowLeft,
  IconX,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconLink,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { TrendingUpIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MarketerAppSidebar } from "@/components/marketer-app-sidebar";
import { DataTable, ViewAction } from "@/components/data-table";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = "Active" | "Paused" | "Unavailable";

interface Campaign {
  id: string;
  productName: string;
  vendor: string;
  coverImage: string;
  totalClicks: number;
  sales: number;
  conversionRate: number; // percentage
  status: CampaignStatus;
}

type ViewMode = "grid" | "table";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    productName: "Kampala Nites App",
    vendor: "Everything Uganda",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 2000,
    sales: 1000,
    conversionRate: 56,
    status: "Active",
  },
  {
    id: "2",
    productName: "The Night I fell in Love-ebook",
    vendor: "Social Gems",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 10000,
    sales: 3000,
    conversionRate: 76,
    status: "Unavailable",
  },
  {
    id: "3",
    productName: "Kavuma's Creative Class",
    vendor: "Social Gems",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 400000,
    sales: 100000,
    conversionRate: 72,
    status: "Active",
  },
  {
    id: "4",
    productName: "Wedding Photography",
    vendor: "Everything Uganda",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 1000,
    sales: 40,
    conversionRate: 81,
    status: "Active",
  },
  {
    id: "5",
    productName: "Safe-jaj app",
    vendor: "World of Africa",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 3000,
    sales: 1000,
    conversionRate: 36,
    status: "Paused",
  },
  {
    id: "6",
    productName: "Betrayed by my leader - ebook",
    vendor: "Horus",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 23000,
    sales: 10000,
    conversionRate: 88,
    status: "Active",
  },
  {
    id: "7",
    productName: "ESM School Manager",
    vendor: "World of Africa",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 82000,
    sales: 2000,
    conversionRate: 58,
    status: "Active",
  },
  {
    id: "8",
    productName: "Savanna Records",
    vendor: "Horus",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 100000,
    sales: 6000,
    conversionRate: 33,
    status: "Active",
  },
  {
    id: "9",
    productName: "Chimpman Deliveries",
    vendor: "Social Gems",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 10000,
    sales: 50000,
    conversionRate: 60,
    status: "Active",
  },
  {
    id: "10",
    productName: "Lawya Lens Consultancy",
    vendor: "Horus",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 55000,
    sales: 5000,
    conversionRate: 88,
    status: "Paused",
  },
  {
    id: "11",
    productName: "24Hr Wedding Photography",
    vendor: "Everything Uganda",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 4000,
    sales: 34000,
    conversionRate: 89,
    status: "Paused",
  },
  {
    id: "12",
    productName: "Safe jaj app",
    vendor: "Everything Uganda",
    coverImage: "/placeholder-product.jpeg",
    totalClicks: 20000,
    sales: 16000,
    conversionRate: 89,
    status: "Active",
  },
];

// ─── Stat cards (same pattern as marketer payouts) ────────────────────────────

interface MarketerStatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  gradient: string;
}

const STAT_CARDS: MarketerStatCard[] = [
  {
    title: "Total Clicks",
    value: "2,000",
    change: "+15%",
    icon: IconClick,
    gradient: "from-[#F97316] to-[#FB923C]",
  },
  {
    title: "Total sales",
    value: "400",
    change: "+5%",
    icon: IconShoppingCart,
    gradient: "from-[#EA580C] to-[#C2410C]",
  },
  {
    title: "Overall Conversion Rate",
    value: "70%",
    change: "+5%",
    icon: IconCurrencyDollar,
    gradient: "from-[#92400E] to-[#78350F]",
  },
];

function StatCardItem({ card }: { card: MarketerStatCard }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-sm",
        card.gradient,
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
            <p className="text-sm font-medium text-white/80">{card.title}</p>
            <div className="rounded-lg p-2 bg-white/20">
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

// ─── Campaign status badge ────────────────────────────────────────────────────

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const styles: Record<CampaignStatus, string> = {
    Active: "border border-teal-500 text-teal-600 bg-white",
    Paused: "border border-orange-400 text-orange-500 bg-white",
    Unavailable: "border border-gray-300 text-gray-400 bg-white",
  };
  return (
    <span
      className={cn(
        "text-xs font-semibold px-2.5 py-0.5 rounded-full",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-foreground hover:border-gray-300 transition-colors">
      {label}
      <IconChevronDown className="size-3.5" />
    </button>
  );
}

// ─── Format numbers ───────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString();
}

// ─── Campaign grid card ───────────────────────────────────────────────────────

function CampaignGridCard({
  campaign,
  onView,
}: {
  campaign: Campaign;
  onView: (c: Campaign) => void;
}) {
  const isUnavailable = campaign.status === "Unavailable";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden flex flex-col",
        isUnavailable && "opacity-60",
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        <img
          src={campaign.coverImage}
          alt={campaign.productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.jpeg";
          }}
        />
        {/* Status badge — top right */}
        <div className="absolute top-3 right-3">
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p
            className={cn(
              "text-base font-bold text-foreground leading-snug",
              isUnavailable && "text-gray-400",
            )}
          >
            {campaign.productName}
          </p>
          <p
            className={cn(
              "text-xs mt-0.5",
              isUnavailable ? "text-gray-400" : "text-muted-foreground",
            )}
          >
            By {campaign.vendor}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-lg">
          {[
            { label: "Total Clicks", value: fmt(campaign.totalClicks) },
            { label: "Conversion rate", value: `${campaign.conversionRate}%` },
            { label: "Total Sales", value: fmt(campaign.sales) },
          ].map(({ label, value }) => (
            <div key={label} className="px-2 py-2 text-center">
              <p
                className={cn(
                  "text-[10px] leading-tight mb-0.5",
                  isUnavailable ? "text-gray-400" : "text-muted-foreground",
                )}
              >
                {label}
              </p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isUnavailable ? "text-gray-400" : "text-foreground",
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* View button */}
        <button
          onClick={() => !isUnavailable && onView(campaign)}
          disabled={isUnavailable}
          className={cn(
            "mt-auto w-full flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors",
            isUnavailable
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-200 text-foreground hover:border-gray-300 hover:bg-gray-50",
          )}
        >
          View campaign details <IconEye className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Table column definitions ─────────────────────────────────────────────────

function useCampaignColumns(
  onView: (c: Campaign) => void,
): ColumnDef<Campaign, unknown>[] {
  return React.useMemo(
    () => [
      {
        id: "picture",
        header: "Picture",
        cell: ({ row }) => (
          <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
            <img
              src={row.original.coverImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder-product.jpeg";
              }}
            />
          </div>
        ),
      },
      {
        id: "name",
        accessorKey: "productName",
        header: "Name",
        cell: ({ row }) => (
          <div
            className={cn(
              row.original.status === "Unavailable" && "opacity-50",
            )}
          >
            <p className="text-sm font-medium text-foreground">
              {row.original.productName}
            </p>
            <p className="text-xs text-muted-foreground">
              By {row.original.vendor}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "totalClicks",
        header: "Clicks",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-sm",
              row.original.status === "Unavailable"
                ? "text-gray-400"
                : "text-foreground",
            )}
          >
            {fmt(row.original.totalClicks)}
          </span>
        ),
      },
      {
        accessorKey: "sales",
        header: "sales",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-sm",
              row.original.status === "Unavailable"
                ? "text-gray-400"
                : "text-foreground",
            )}
          >
            {fmt(row.original.sales)}
          </span>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "Conv. Rate",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-sm",
              row.original.status === "Unavailable"
                ? "text-gray-400"
                : "text-foreground",
            )}
          >
            {row.original.conversionRate}%
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ViewAction
            onClick={
              row.original.status !== "Unavailable"
                ? () => onView(row.original)
                : undefined
            }
          />
        ),
      },
    ],
    [onView],
  );
}

// ─── Single Campaign Detail View ──────────────────────────────────────────────

type ModalType = "pause" | "activate" | "delete" | "hoplink";

function Sparkline() {
  return (
    <svg viewBox="0 0 120 30" className="w-full h-8" fill="none">
      <polyline
        points="0,20 20,15 40,22 60,10 80,18 100,8 120,14"
        stroke="#F97316"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 rounded-xl border border-gray-100 bg-white px-5 py-4 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex size-7 items-center justify-center rounded-lg bg-[#F97316]/10">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="ml-auto text-2xl font-bold text-foreground">
          {value}
        </span>
      </div>
      <Sparkline />
    </div>
  );
}

function ConfirmModal({
  type,
  onClose,
  onConfirm,
  loading,
}: {
  type: "pause" | "activate" | "delete";
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const config = {
    pause: {
      illustration: "/wonder.png",
      title: "Pause this Campaign?",
      body: "Would you like to pause this campaign? You will not be able to earn from sales made. You can always activate this product.",
    },
    activate: {
      illustration: "/trash.png",
      title: "Activate this Campaign?",
      body: "You will be able to earn from sales made through your link once activated",
    },
    delete: {
      illustration: "/trash.png",
      title: "Delete this Campaign?",
      body: "Do you want to permanently remove it from your campaign manager? This action is not reversible",
    },
  };
  const { illustration, title, body } = config[type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>
        <div className="flex justify-center mb-5">
          <img src={illustration} alt="" className="h-32 w-32 object-contain" />
        </div>
        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          {title}
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          {body}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-foreground hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#1a1a1a] py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors disabled:opacity-60"
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HoplinkModal({
  link,
  onClose,
}: {
  link: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>
        <div className="flex justify-center mb-5">
          <img src="/success.png" alt="" className="h-36 w-36 object-contain" />
        </div>
        <h2 className="text-xl font-bold text-center text-foreground mb-1">
          Here's your hoplink!
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6">
          Your hoplink has been successfully generated
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 mb-2">
          <p className="flex-1 min-w-0 truncate text-xs text-muted-foreground">
            {link}
          </p>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
          >
            {copied ? (
              <IconCheck className="size-3.5" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        <div className="flex justify-center mt-5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-md bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            <span className="flex size-5 items-center justify-center rounded-full border-2 border-[#F97316]">
              <IconCheck className="size-3 text-[#F97316]" strokeWidth={3} />
            </span>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function PauseToggle({
  isPaused,
  onClick,
}: {
  isPaused: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 group"
      type="button"
    >
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          isPaused ? "bg-[#F97316]" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            isPaused ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-[#F97316] transition-colors">
        Pause Campaign
      </span>
    </button>
  );
}

function SingleCampaignView({
  campaign,
  onBack,
}: {
  campaign: Campaign;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<"Active" | "Paused">(
    campaign.status === "Unavailable" ? "Active" : campaign.status,
  );
  const [activeImg, setActiveImg] = useState(0);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [hoplink, setHoplink] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const isPaused = status === "Paused";

  const handleConfirm = async () => {
    if (!modal || modal === "hoplink") return;
    setModalLoading(true);
    try {
      if (modal === "pause") {
        await api.post(`/api/v1/campaigns/${campaign.id}/pause`);
        setStatus("Paused");
        toast.success("Campaign paused successfully");
      } else if (modal === "activate") {
        await api.post(`/api/v1/campaigns/${campaign.id}/activate`);
        setStatus("Active");
        toast.success("Campaign activated successfully");
      } else if (modal === "delete") {
        await api.delete(`/api/v1/campaigns/${campaign.id}`);
        toast.success("Campaign deleted successfully");
        onBack();
      }
      setModal(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Action failed. Please try again.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleGetHoplink = async () => {
    setGeneratingLink(true);
    try {
      const { data } = await api.post(
        `/api/v1/products/${campaign.id}/affiliate-link`,
      );
      const link =
        data?.affiliateLink ??
        data?.hoplink ??
        `https://tekaffiliate.com/ref/${campaign.id}`;
      setHoplink(link);
      setModal("hoplink");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate hoplink");
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://example.com/sales").catch(() => {});
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const statusBadgeStyles: Record<"Active" | "Paused", string> = {
    Active: "border border-teal-500 text-teal-600",
    Paused: "border border-orange-400 text-orange-500",
  };

  // Mock detail data derived from campaign
  const price = 20000;
  const commissionPct = 30;
  const commissionEarned = Math.round(
    (campaign.sales * ((price * commissionPct) / 100)) / 1000,
  );
  const coverImages = [
    campaign.coverImage,
    campaign.coverImage,
    campaign.coverImage,
  ];

  const description = `${campaign.productName} is a leading product by ${campaign.vendor} that helps users get the most out of their experience. This platform is designed for professionals and enthusiasts alike, providing cutting-edge features and seamless integration.\n\nDesigned for a wide audience, ${campaign.productName} centralizes key information into one accessible digital platform.`;
  const details = [
    "Real-time activity tracking",
    "Advanced analytics and reports",
    "User profiles with ratings and reviews",
    "Push notifications for upcoming events",
    "Location-based recommendations",
    "User favorites & saved items",
    "Dashboard access for managers",
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
      <MarketerAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={onBack}
              className="text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              Campaign Management
            </h1>
          </div>

          {/* Product name + status */}
          <div className="rounded-xl border bg-white px-6 py-4 flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {campaign.productName}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                By {campaign.vendor}
              </p>
            </div>
            <span
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full bg-white",
                statusBadgeStyles[status],
              )}
            >
              {status}
            </span>
          </div>

          {/* 3 mini stat cards */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <MiniStatCard
              icon={
                <svg
                  className="size-4 text-[#F97316]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              }
              label="Total Clicks"
              value={campaign.totalClicks.toLocaleString()}
            />
            <MiniStatCard
              icon={
                <svg
                  className="size-4 text-[#F97316]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
              label="Total Sales"
              value={campaign.sales.toLocaleString()}
            />
            <MiniStatCard
              icon={
                <svg
                  className="size-4 text-[#F97316]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              label="Conversion rate"
              value={`${campaign.conversionRate}%`}
            />
          </div>

          {/* Main content */}
          <div className="rounded-xl border bg-white p-6 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: images + pricing */}
              <div>
                <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video mb-3">
                  <img
                    src={coverImages[activeImg]}
                    alt={campaign.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-product.jpeg";
                    }}
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  {coverImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "size-14 rounded-lg overflow-hidden border-2 transition-colors",
                        i === activeImg
                          ? "border-[#F97316]"
                          : "border-gray-100",
                      )}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-product.jpeg";
                        }}
                      />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-200 border border-gray-100 rounded-xl">
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="text-lg font-bold">
                      ${price.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Affiliate Commission
                    </p>
                    <p className="text-lg font-bold">{commissionPct}%</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      commission Earned
                    </p>
                    <p className="text-lg font-bold">
                      ${commissionEarned.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: description + details */}
              <div>
                <h3 className="text-base font-bold text-foreground mb-3">
                  Product description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-6">
                  {description}
                </p>
                <h3 className="text-base font-bold text-foreground mb-3">
                  Product details
                </h3>
                <ul className="space-y-1.5">
                  {details.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 rounded-full bg-foreground shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="rounded-xl border bg-white px-6 py-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
              >
                Go to sales page <IconExternalLink className="size-4" />
              </a>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors"
              >
                {urlCopied ? (
                  <IconCheck className="size-4 text-green-500" />
                ) : (
                  <IconCopy className="size-4" />
                )}
                Copy URL
              </button>
              <button
                onClick={handleGetHoplink}
                disabled={generatingLink}
                className="ml-auto flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors disabled:opacity-60"
              >
                <IconLink className="size-4" />
                {generatingLink ? "Generating…" : "Get Hoplink"}
              </button>
            </div>
          </div>

          {/* Campaign controls */}
          <div className="rounded-xl border bg-white px-6 py-4 flex items-center justify-between">
            <PauseToggle
              isPaused={isPaused}
              onClick={() => setModal(isPaused ? "activate" : "pause")}
            />
            <button
              onClick={() => setModal("delete")}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Delete Campaign <IconTrash className="size-4" />
            </button>
          </div>
        </div>
      </SidebarInset>

      {/* Modals */}
      {(modal === "pause" || modal === "activate" || modal === "delete") && (
        <ConfirmModal
          type={modal}
          onClose={() => setModal(null)}
          onConfirm={handleConfirm}
          loading={modalLoading}
        />
      )}
      {modal === "hoplink" && hoplink && (
        <HoplinkModal
          link={hoplink}
          onClose={() => {
            setModal(null);
            setHoplink(null);
          }}
        />
      )}
    </SidebarProvider>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketerCampaignsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 9; // grid: 3×3, table: 10

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_CAMPAIGNS;
    const q = search.toLowerCase();
    return MOCK_CAMPAIGNS.filter(
      (c) =>
        c.productName.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q),
    );
  }, [search]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  const hasData = MOCK_CAMPAIGNS.length > 0;

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const columns = useCampaignColumns(handleView);

  const tablePageSize = 10;
  const gridPageSize = 9;
  const currentPageSize = viewMode === "table" ? tablePageSize : gridPageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice(
    (page - 1) * currentPageSize,
    page * currentPageSize,
  );

  // If a campaign is selected, render the detail view inline
  if (selectedCampaign) {
    return (
      <SingleCampaignView
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <MarketerAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
          <h1 className="text-2xl font-bold text-foreground mb-5">
            My Campaigns
          </h1>

          {/* Stat cards — only show when there are campaigns */}
          {hasData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {STAT_CARDS.map((card) => (
                <StatCardItem key={card.title} card={card} />
              ))}
            </div>
          )}

          {/* Main content card */}
          <div className="rounded-xl border bg-white p-6 flex-1">
            {!hasData ? (
              /* ── Empty state ── */
              <>
                {/* Search + sort (always visible) */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative max-w-md w-full">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a campaign"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                    />
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Sort by:</span>
                    <span className="text-[#F97316] font-semibold">
                      Most Clicks
                    </span>
                    <span className="text-gray-300">|</span>
                    <IconArrowDown className="size-4 text-[#F97316]" />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex items-center justify-center p-6 h-52 w-52 border rounded-full bg-[#EFEFEF] mb-6">
                    <img
                      src="/emptystate.png"
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    No active Marketing Campaign
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Find products to promote in marketplace
                  </p>
                  <button className="rounded-lg bg-[#1a1a1a] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors">
                    Go to Marketplace
                  </button>
                </div>
              </>
            ) : (
              /* ── Campaigns (grid or table) ── */
              <>
                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="relative max-w-xs w-full">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={
                        viewMode === "grid" ? "Search for a campaign" : "Search"
                      }
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                    />
                  </div>

                  <div className="ml-auto flex items-center gap-3 text-sm flex-wrap">
                    {/* Filters button (table view) */}
                    {viewMode === "table" && (
                      <button className="flex items-center gap-1.5 text-foreground hover:text-[#F97316] transition-colors">
                        <IconFilter className="size-4" /> Filters
                      </button>
                    )}

                    {/* Sort */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Sort by:</span>
                      <span className="text-[#F97316] font-semibold">
                        {viewMode === "grid" ? "Most Clicks" : "Ascending"}
                      </span>
                      <span className="text-gray-300">|</span>
                      <IconArrowDown className="size-4 text-[#F97316]" />
                    </div>

                    {/* View toggle */}
                    <button
                      onClick={() => {
                        setViewMode(viewMode === "grid" ? "table" : "grid");
                        setPage(1);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-foreground hover:border-gray-300 transition-colors"
                    >
                      {viewMode === "grid" ? (
                        <>
                          <IconLayoutList className="size-4" /> Table view
                        </>
                      ) : (
                        <>
                          <IconLayoutGrid className="size-4" /> Grid view
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Filter bar (grid view only) */}
                {viewMode === "grid" && (
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
                      <IconFilter className="size-4" />
                      <span>Filter products by</span>
                    </div>
                    <FilterChip label="Category" />
                    <FilterChip label="Commission" />
                    <FilterChip label="Date" />
                    <FilterChip label="Price" />
                  </div>
                )}

                {/* ── Grid view ── */}
                {viewMode === "grid" && (
                  <>
                    {paginated.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex items-center justify-center p-6 h-48 w-48 border rounded-full bg-[#EFEFEF] mb-4">
                          <img
                            src="/emptystate.png"
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          No campaigns match your search
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                        {paginated.map((campaign) => (
                          <CampaignGridCard
                            key={campaign.id}
                            campaign={campaign}
                            onView={handleView}
                          />
                        ))}
                      </div>
                    )}

                    {/* Grid pagination */}
                    {paginated.length > 0 && (
                      <GridPagination
                        currentPage={page}
                        totalPages={totalPages}
                        total={filtered.length}
                        pageSize={gridPageSize}
                        onPageChange={setPage}
                      />
                    )}
                  </>
                )}

                {/* ── Table view — uses DataTable ── */}
                {viewMode === "table" && (
                  <DataTable
                    className="border-none p-0"
                    columns={columns}
                    data={filtered}
                    showFilters={false}
                    showSort={false}
                    showSelection
                    showPagination
                    searchColumn={undefined}
                    pageSize={tablePageSize}
                    emptyMessage="No campaigns found"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Grid pagination (same logic as DataTable's TablePagination) ───────────────

interface GridPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function GridPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: GridPaginationProps) {
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    pages.push(1, 2, 3);
    if (currentPage > 4) pages.push("ellipsis");
    if (currentPage > 3 && currentPage < totalPages - 1) {
      if (!pages.includes(currentPage - 1)) pages.push(currentPage - 1);
      if (!pages.includes(currentPage)) pages.push(currentPage);
      if (!pages.includes(currentPage + 1)) pages.push(currentPage + 1);
      pages.push("ellipsis");
    } else if (currentPage <= 3) {
      pages.push("ellipsis");
    }
    if (!pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center gap-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors"
        >
          <IconChevronLeft className="size-4" /> Previous
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="flex size-8 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "flex size-8 items-center justify-center rounded text-sm font-medium transition-colors",
                  p === currentPage
                    ? "border border-gray-300 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors"
        >
          Next <IconChevronRight className="size-4" />
        </button>
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Showing {startItem} - {endItem} of {total}
      </span>
    </div>
  );
}
