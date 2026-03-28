"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconArrowDown,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconCopy,
  IconCheck,
  IconX,
  IconExternalLink,
  IconBroadcast,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MarketerAppSidebar } from "@/components/marketer-app-sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  title: string;
  vendor: string;
  price: number;
  commissionRate: number; // e.g. 30 = 30%
  earnings: number; // price * commissionRate / 100
  category: string;
  subcategory?: string;
  status: "Active" | "Inactive";
  description: string;
  details: string[];
  coverImages: string[];
  salesPageUrl: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Kampala Nites App",
    vendor: "Everything Uganda",
    price: 20000,
    commissionRate: 30,
    earnings: 6000,
    category: "Software & Apps",
    subcategory: "Mobile Apps",
    status: "Active",
    description:
      "Kampala Nites App is a nightlife tracking and discovery platform that helps users explore events, clubs, lounges, and entertainment spots across Kampala in real time.",
    details: [
      "Real-time nightlife activity tracking",
      "Event discovery and listings",
      "Venue profiles with ratings and reviews",
      "Push notifications for upcoming events",
      "Location-based recommendations",
      "User favorites & saved events",
      "Organizer and venue dashboard access",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/kampala-nites",
  },
  {
    id: "2",
    title: "Betrayed by my Leader",
    vendor: "Social Gems",
    price: 200,
    commissionRate: 30,
    earnings: 60,
    category: "Books",
    subcategory: "Fiction",
    status: "Active",
    description:
      "A gripping political thriller about power, betrayal, and the fight for justice in modern Africa.",
    details: [
      "380 pages",
      "Digital + print edition",
      "Available in English and Luganda",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/betrayed",
  },
  {
    id: "3",
    title: "24Hr Wedding Photography",
    vendor: "Horus",
    price: 1000,
    commissionRate: 30,
    earnings: 6000,
    category: "Services",
    subcategory: "Photography",
    status: "Active",
    description:
      "Professional wedding photography packages available 24 hours, capturing every moment of your special day.",
    details: [
      "Full-day coverage",
      "500+ edited photos",
      "Online gallery delivery",
      "Print packages available",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/wedding-photo",
  },
  {
    id: "4",
    title: "Door to Door Delivery",
    vendor: "Africa Connect",
    price: 10000,
    commissionRate: 30,
    earnings: 3000,
    category: "Services",
    subcategory: "Logistics",
    status: "Active",
    description:
      "Fast and reliable door-to-door delivery service across East Africa.",
    details: [
      "Same-day delivery available",
      "Real-time tracking",
      "Insured packages",
      "Pan-East Africa coverage",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/delivery",
  },
  {
    id: "5",
    title: "Law Firm App",
    vendor: "Africa Connect",
    price: 3000,
    commissionRate: 30,
    earnings: 900,
    category: "Software & Apps",
    subcategory: "Legal",
    status: "Active",
    description:
      "A comprehensive legal case management app designed for law firms across Africa.",
    details: [
      "Case tracking",
      "Document management",
      "Client portal",
      "Billing & invoicing",
      "Calendar integration",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/law-app",
  },
  {
    id: "6",
    title: "Law Firm App Premium",
    vendor: "Africa Connect",
    price: 5000,
    commissionRate: 30,
    earnings: 1200,
    category: "Software & Apps",
    subcategory: "Legal",
    status: "Active",
    description:
      "Premium tier of the Law Firm App with advanced analytics and AI-powered document review.",
    details: [
      "All Standard features",
      "AI document review",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/law-app-premium",
  },
  {
    id: "7",
    title: "Creative Class",
    vendor: "Social Gems",
    price: 20000,
    commissionRate: 30,
    earnings: 6000,
    category: "Courses",
    subcategory: "Design",
    status: "Active",
    description:
      "Learn graphic design from scratch — posters, logos, illustrations and more.",
    details: [
      "40+ video lessons",
      "Downloadable resources",
      "Certificate on completion",
      "Lifetime access",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/creative-class",
  },
  {
    id: "8",
    title: "The Night I Fell in Love - Ebook",
    vendor: "Social Gems",
    price: 200,
    commissionRate: 30,
    earnings: 60,
    category: "Books",
    subcategory: "Romance",
    status: "Active",
    description:
      "A heartfelt romance novel set against the backdrop of Kampala's vibrant social scene.",
    details: ["220 pages", "Digital download", "Compatible with all e-readers"],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/night-love",
  },
  {
    id: "9",
    title: "Learn Spanish with Señor Esperazzo",
    vendor: "Social Gems",
    price: 1000,
    commissionRate: 30,
    earnings: 300,
    category: "Courses",
    subcategory: "Language",
    status: "Active",
    description:
      "A comprehensive Spanish learning program designed for African learners, combining video lessons with cultural immersion.",
    details: [
      "60+ video lessons",
      "Audio exercises",
      "Printable workbooks",
      "Monthly live Q&A sessions",
    ],
    coverImages: ["/placeholder-product.jpeg"],
    salesPageUrl: "https://example.com/spanish",
  },
];

const ITEMS_PER_PAGE = 9;

// ─── Hoplink (affiliate link) modal ──────────────────────────────────────────

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Success illustration */}
        <div className="flex justify-center mb-5">
          <img src="/success.png" alt="" className="h-36 w-36 object-contain" />
        </div>

        <h2 className="text-xl font-bold text-center text-foreground mb-1">
          Here's your hoplink!
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6">
          Your hoplink has been successfully generated
        </p>

        {/* Link + copy */}
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

// ─── Product detail sheet ─────────────────────────────────────────────────────

function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  onGenerate,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (link: string) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [urlCopied, setUrlCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  React.useEffect(() => {
    setActiveImg(0);
  }, [product?.id]);

  if (!product) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(product.salesPageUrl).catch(() => {});
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleGenerateLink = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post(
        `/api/v1/products/${product.id}/affiliate-link`,
      );
      const link =
        data?.affiliateLink ??
        data?.hoplink ??
        `https://tekaffiliate.com/ref/${product.id}`;
      onGenerate(link);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate affiliate link",
      );
    } finally {
      setGenerating(false);
    }
  };

  const images =
    product.coverImages.length > 0
      ? product.coverImages
      : ["/placeholder-product.jpeg"];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[520px] overflow-y-auto p-0"
      >
        <div className="p-6">
          {/* Header */}
          <SheetHeader className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-lg font-bold text-foreground">
                  {product.title}
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.category}
                  {product.subcategory ? ` / ${product.subcategory}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500 text-teal-600">
                {product.status}
              </span>
            </div>
          </SheetHeader>

          {/* Main image */}
          <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video mb-3">
            <img
              src={images[activeImg]}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder-product.jpeg";
              }}
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-5">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "size-14 rounded-lg overflow-hidden border-2 transition-colors",
                    i === activeImg ? "border-[#F97316]" : "border-gray-100",
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
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl mb-5 bg-gray-50/60">
            {[
              { label: "Price", value: `$${product.price.toLocaleString()}` },
              {
                label: "Affiliate Commission",
                value: `${product.commissionRate}%`,
              },
              {
                label: "What you get",
                value: `$${product.earnings.toLocaleString()}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-3">
            <a
              href={product.salesPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#F97316] py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
            >
              Go to sales page <IconExternalLink className="size-4" />
            </a>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors"
            >
              {urlCopied ? (
                <IconCheck className="size-4 text-green-500" />
              ) : (
                <IconCopy className="size-4" />
              )}
              Copy URL
            </button>
          </div>

          <button
            onClick={handleGenerateLink}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#333] transition-colors disabled:opacity-60 mb-6"
          >
            {generating ? (
              <svg
                className="size-4 animate-spin"
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
            ) : (
              <IconBroadcast className="size-4" />
            )}
            {generating ? "Generating…" : "Generate affiliate link"}
          </button>

          {/* Description */}
          <div className="mb-5">
            <h3 className="text-base font-bold text-foreground mb-2">
              Product description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Details */}
          {product.details.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">
                Product details
              </h3>
              <ul className="space-y-1.5">
                {product.details.map((d, i) => (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onView,
  onPromote,
}: {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onView: (product: Product) => void;
  onPromote: (product: Product) => void;
}) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.coverImages[0] || "/placeholder-product.jpeg"}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-product.jpeg";
          }}
        />
        {/* Heart */}
        {/* <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
        >
          {isFavorite ? (
            <IconHeartFilled className="size-4 text-red-500" />
          ) : (
            <IconHeart className="size-4 text-gray-500" />
          )}
        </button> */}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {/* Earnings + commission badge */}
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-foreground">
            Get{" "}
            <span className="text-foreground">
              ${product.earnings.toLocaleString()}
            </span>{" "}
            <span className="text-xs font-normal text-muted-foreground">
              per sale
            </span>
          </p>
          <span className="ml-auto text-xs font-semibold bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-full">
            {product.commissionRate}%
          </span>
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">
          {product.title}
        </p>
        <p className="text-xs text-muted-foreground">By {product.vendor}</p>
        <p className="text-xs text-foreground mt-0.5">
          Price: ${product.price.toLocaleString()}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView(product)}
          className="min-w-[120px] flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-foreground hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <IconEye className="size-3.5" /> View
        </button>
        <button
          onClick={() => onPromote(product)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#F97316] py-2 text-xs font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
        >
          <IconBroadcast className="size-3.5" /> Get Affiliate Link
        </button>
      </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[#F97316] bg-orange-50 text-[#F97316]"
          : "border-gray-200 bg-white text-foreground hover:border-gray-300",
      )}
    >
      {label}
      <IconChevronDown className="size-3.5 text-current" />
    </button>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function TablePagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1, 2, 3);
    if (currentPage > 4) {
      pages.push("ellipsis");
    }
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
    <div className="flex items-center justify-between border-t px-0 pt-4">
      <div className="flex items-center justify-between gap-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors disabled:hover:text-muted-foreground"
        >
          <IconChevronLeft className="size-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
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
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors disabled:hover:text-muted-foreground"
        >
          Next
          <IconChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {startItem} - {endItem} of {total}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketerMarketplacePage() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Sheet / modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hoplinkModal, setHoplinkModal] = useState<{ link: string } | null>(
    null,
  );

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setSheetOpen(true);
  };

  const handlePromote = async (product: Product) => {
    try {
      const { data } = await api.post(
        `/api/v1/products/${product.id}/affiliate-link`,
      );
      const link =
        data?.affiliateLink ??
        data?.hoplink ??
        `https://tekaffiliate.com/ref/${product.id}`;
      setHoplinkModal({ link });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate affiliate link",
      );
    }
  };

  const handleSheetGenerate = (link: string) => {
    setSheetOpen(false);
    setHoplinkModal({ link });
  };

  // Filter + search
  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS;
    if (showFavoritesOnly) list = list.filter((p) => favorites.has(p.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, showFavoritesOnly, favorites]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

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
            Market Place
          </h1>

          {/* Search + Sort */}
          <div className="flex items-center gap-3 mb-4 p-6 rounded-lg bg-white flex-wrap">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a product"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
              />
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <button className="flex items-center gap-1 text-[#F97316] font-semibold hover:underline">
                Highest commission
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-[#F97316]">
                <IconArrowDown className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 rounded-lg bg-white flex-wrap">
            {/* Filter bar */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
                <IconFilter className="size-4" />
                <span>Filter products by</span>
              </div>
              {/* My Favorites chip */}
              <button
                onClick={() => {
                  setShowFavoritesOnly((v) => !v);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  showFavoritesOnly
                    ? "border-[#F97316] bg-orange-50 text-[#F97316]"
                    : "border-gray-200 bg-white text-foreground hover:border-gray-300",
                )}
              >
                {showFavoritesOnly ? (
                  <IconHeartFilled className="size-3.5 text-[#F97316]" />
                ) : (
                  <IconHeart className="size-3.5" />
                )}
                My Favorites
              </button>
              <FilterChip label="Category" />
              <FilterChip label="Commission" />
              <FilterChip label="Date" />
              <FilterChip label="Price" />
            </div>

            {/* Product grid or empty state */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex items-center justify-center p-6 h-52 w-52 border rounded-full bg-[#EFEFEF] mb-6">
                  <img
                    src="/emptystate.png"
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  No Products found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try setting a different filter
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                  {paginated.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.has(product.id)}
                      onToggleFavorite={toggleFavorite}
                      onView={handleView}
                      onPromote={handlePromote}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={filtered.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Product detail sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGenerate={handleSheetGenerate}
      />

      {/* Hoplink modal */}
      {hoplinkModal && (
        <HoplinkModal
          link={hoplinkModal.link}
          onClose={() => setHoplinkModal(null)}
        />
      )}
    </SidebarProvider>
  );
}
