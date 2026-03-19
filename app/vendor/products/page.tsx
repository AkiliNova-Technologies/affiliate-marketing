"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconCopy,
  IconCheck,
  IconPackage,
  IconAlertCircle,
  IconUpload,
  IconClock,
  IconTrendingUp,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge, ViewAction } from "@/components/data-table";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import { useReduxVendor } from "@/hooks/useReduxVendor";
import type { VendorProduct } from "@/redux/slices/vendorProductsSlice";

// ─── Field helpers ────────────────────────────────────────────────────────────
// Typed directly against VendorProduct from vendorProductsSlice.

function getProductName(p: VendorProduct): string {
  return p.name ?? "—";
}

function getProductPrice(p: VendorProduct): number {
  return p.price ?? 0;
}

function getProductImage(p: VendorProduct): string | undefined {
  // Slice stores images as string[] — first item is the primary image
  return p.images?.[0];
}

function getProductCategory(p: VendorProduct): string {
  // Slice exposes categoryName as a flat string
  return p.categoryName ?? p.categoryId ?? "—";
}

function getProductStatus(p: VendorProduct): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending Approval",
    ACTIVE: "Active",
    // Slice uses PENDING_REAPPROVAL (no underscore before RE)
    PENDING_REAPPROVAL: "Pending re-approval",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    DELETED: "Deleted",
  };
  return map[p.status?.toUpperCase?.()] ?? p.status ?? "—";
}

function getProductSalesUrl(p: VendorProduct): string {
  // VendorProduct uses index signature [key: string]: any
  return p.salesPageUrl ?? p.websiteUrl ?? p.salePageUrl ?? "";
}

function getProductThankYouUrl(p: VendorProduct): string {
  return p.thankYouPageUrl ?? p.thankYouUrl ?? "";
}

function getProductDescription(p: VendorProduct): string {
  return p.description ?? "";
}

function getProductCommission(p: VendorProduct): number {
  return p.affiliateCommission ?? p.commissionRate ?? 0;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 56)",
  "--header-height": "calc(var(--spacing) * 14)",
} as React.CSSProperties;

const PAGE_SIZE = 10;
const VENDOR_PERCENT = 70;
const AFFILIATE_PERCENT = 20;
const PLATFORM_PERCENT = 10;

const CATEGORIES = [
  "Software & Apps",
  "eBooks",
  "Courses",
  "Services & Consulting",
  "Music",
  "Photography",
  "Health & Fitness",
  "Finance",
];

// ─── Page shell ───────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={SIDEBAR_STYLE}>
      <VendorAppSidebar variant="sidebar" />
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

// ─── Step indicator ───────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4;
const STEP_LABELS: Record<StepId, string> = {
  1: "Identity",
  2: "Pricing",
  3: "Integration",
  4: "Review & Submit",
};

function StepIndicator({ current }: { current: StepId }) {
  return (
    <div className="flex items-center gap-0">
      {([1, 2, 3, 4] as StepId[]).map((step, idx) => {
        const isActive = step === current;
        const isDone = step < current;
        return (
          <React.Fragment key={step}>
            {idx > 0 && (
              <div
                className={cn(
                  "h-px w-8 md:w-12 shrink-0",
                  isDone ? "bg-[#F97316]" : "bg-gray-200",
                )}
              />
            )}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive
                    ? "px-3 py-1.5 h-8 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30"
                    : "size-8 " +
                        (isDone
                          ? "bg-[#F97316] text-white"
                          : "bg-gray-100 text-gray-400 border border-gray-200"),
                )}
              >
                {isDone ? (
                  <IconCheck className="size-4" />
                ) : isActive ? (
                  <p className="text-[#3C3C4399] text-xs flex gap-1.5">
                    Step {step}{" "}
                    <span className="font-bold text-[#F97316]">
                      {STEP_LABELS[step]}
                    </span>
                  </p>
                ) : (
                  step
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Image uploader ───────────────────────────────────────────────────────────

function ImageUploader({
  images,
  onChange,
}: {
  images: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(
      (f) => f.type === "image/png" || f.type === "image/jpeg",
    );
    onChange([...images, ...valid].slice(0, 5));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[200px]",
          dragging
            ? "border-[#F97316] bg-orange-50"
            : "border-gray-200 bg-white hover:border-[#F97316]/50",
        )}
      >
        <div className="flex items-center justify-center rounded-xl bg-[#F97316] p-3">
          <IconUpload className="size-5 text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Max 10mb file size, Only png and .jpeg files
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((file, i) => (
            <div
              key={i}
              className="relative size-16 rounded-lg overflow-hidden border border-gray-100"
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(images.filter((_, idx) => idx !== i));
                }}
                className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <IconX className="size-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step form types ──────────────────────────────────────────────────────────

interface IdentityData {
  name: string;
  category: string;
  description: string;
  images: File[];
}
interface PricingData {
  price: string;
}
interface IntegrationData {
  websiteUrl: string;
  thankYouUrl: string;
}
const URL_REGEX = /^https?:\/\/.+/;

// ─── Step 1: Identity ─────────────────────────────────────────────────────────

function StepIdentity({
  data,
  onChange,
  onNext,
}: {
  data: IdentityData;
  onChange: (d: Partial<IdentityData>) => void;
  onNext: () => void;
}) {
  const isValid =
    data.name.trim().length > 0 &&
    data.category &&
    data.description.trim().length > 0;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Product Name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Text input, max 100 chars)."
            maxLength={100}
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Category <span className="text-[#F97316]">*</span>
          </label>
          <Select
            value={data.category}
            onValueChange={(v) => onChange({ category: v })}
          >
            <SelectTrigger className="min-h-11 w-full border-gray-200">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-0.5">
            Product Description <span className="text-[#F97316]">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Describe your product.
          </p>
          <Textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={8}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#F97316]"
          />
        </div>
      </div>
      <div className="rounded-xl border bg-white p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Your Product Picture <span className="text-[#F97316]">*</span>
        </label>
        <ImageUploader
          images={data.images}
          onChange={(images) => onChange({ images })}
        />
      </div>
      <div className="lg:col-span-2 flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "h-11 px-10 gap-2 rounded-md font-semibold",
            isValid
              ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
              : "bg-[#F97316]/30 text-white cursor-not-allowed pointer-events-none",
          )}
        >
          Next <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Pricing ──────────────────────────────────────────────────────────

function StepPricing({
  data,
  onChange,
  onNext,
}: {
  data: PricingData;
  onChange: (d: Partial<PricingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const price = parseFloat(data.price) || 0;
  const isValid = price > 0;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-300 bg-white p-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Price Amount (USD) <span className="text-[#F97316]">*</span>
          </label>
          <Input
            type="number"
            value={data.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="Enter price, decimals are allowed"
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </div>
        <div className="rounded-xl border border-gray-300 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <IconAlertCircle className="size-4 text-gray-500 shrink-0" />
            <p className="text-sm font-bold text-foreground">Disclaimer</p>
          </div>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">
                  Vendors receive {VENDOR_PERCENT}%
                </span>{" "}
                of each confirmed sale. Affiliate marketers earn{" "}
                {AFFILIATE_PERCENT}% commission per verified sale.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">
                  Tek Affiliate retains {PLATFORM_PERCENT}%
                </span>{" "}
                to cover platform and operational costs.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                All pay-outs are subject to verification. For more details,{" "}
                <a href="#" className="text-blue-500 underline">
                  please review the policy
                </a>{" "}
                or{" "}
                <a href="#" className="text-blue-500 underline">
                  contact support
                </a>
                .
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 border border-gray-300 rounded-xl bg-white p-5">
        {[
          {
            label: "Vendor Earns",
            pct: VENDOR_PERCENT,
            amount: (price * VENDOR_PERCENT) / 100,
          },
          {
            label: "Affiliate Earns",
            pct: AFFILIATE_PERCENT,
            amount: (price * AFFILIATE_PERCENT) / 100,
          },
          // {
          //   label: "Tek Affiliate Charge",
          //   pct: PLATFORM_PERCENT,
          //   amount: (price * PLATFORM_PERCENT) / 100,
          // },
        ].map(({ label, pct, amount }) => (
          <div key={label}>
            <p className="text-sm font-normal text-foreground mb-2">{label}</p>
            <div className="rounded-xl border bg-[#F7F7F7] p-5">
              <p className="text-2xl font-semibold text-foreground">
                {pct}% of each sale
              </p>
              {price > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  USD {amount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-2 flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "h-11 px-10 gap-2 rounded-md font-semibold",
            isValid
              ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
              : "bg-[#F97316]/30 text-white cursor-not-allowed pointer-events-none",
          )}
        >
          Next <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Integration ──────────────────────────────────────────────────────

function StepIntegration({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: IntegrationData;
  onChange: (d: Partial<IntegrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isValid =
    URL_REGEX.test(data.websiteUrl) && URL_REGEX.test(data.thankYouUrl);
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border bg-white p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Website URL <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={data.websiteUrl}
            onChange={(e) => onChange({ websiteUrl: e.target.value })}
            placeholder="Enter a valid URL format"
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Thank You Page URL <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={data.thankYouUrl}
            onChange={(e) => onChange({ thankYouUrl: e.target.value })}
            placeholder="Enter a valid URL format"
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "h-11 px-10 gap-2 rounded-xl font-semibold",
            isValid
              ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
              : "bg-[#F97316]/30 text-white cursor-not-allowed pointer-events-none",
          )}
        >
          Next <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Submit ──────────────────────────────────────────────────

function StepReview({
  identity,
  pricing,
  integration,
  onEdit,
  onSubmit,
  submitting,
}: {
  identity: IdentityData;
  pricing: PricingData;
  integration: IntegrationData;
  onEdit: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const price = parseFloat(pricing.price) || 0;
  const previewImage = identity.images[0]
    ? URL.createObjectURL(identity.images[0])
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Identity */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Identity</h2>
        <div className="rounded-xl border bg-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {[
              { label: "Product Name *", value: identity.name },
              { label: "Category *", value: identity.category },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-foreground">
                  {value}
                  <span className="text-gray-300">▾</span>
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Product Description *
              </p>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-foreground min-h-[120px] whitespace-pre-wrap leading-relaxed">
                {identity.description}
              </div>
            </div>
          </div>
          <div>
            {previewImage ? (
              <div className="rounded-xl overflow-hidden border border-gray-100 aspect-[4/3] bg-gray-50">
                <img
                  src={previewImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 aspect-[4/3] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <IconPackage className="size-10" />
                  <span className="text-sm">No image uploaded</span>
                </div>
              </div>
            )}
            {identity.images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {identity.images.slice(1, 4).map((f, i) => (
                  <div
                    key={i}
                    className="size-14 rounded-lg overflow-hidden border border-gray-100"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Pricing</h2>
        <div className="rounded-xl border bg-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Price Amount (USD) *
              </p>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-foreground">
                {pricing.price}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertCircle className="size-3.5 text-gray-400" />
                <p className="text-xs font-bold text-foreground">Disclaimer</p>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>
                  •{" "}
                  <span className="font-semibold text-foreground">
                    Vendors receive {VENDOR_PERCENT}%
                  </span>{" "}
                  of each confirmed sale.
                </li>
                <li>
                  •{" "}
                  <span className="font-semibold text-foreground">
                    Tek Affiliate retains {PLATFORM_PERCENT}%
                  </span>{" "}
                  to cover platform costs.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                label: "Vendor Earns",
                pct: VENDOR_PERCENT,
                amount: (price * VENDOR_PERCENT) / 100,
              },
              {
                label: "Affiliate Earns",
                pct: AFFILIATE_PERCENT,
                amount: (price * AFFILIATE_PERCENT) / 100,
              },
            ].map(({ label, pct, amount }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold">{pct}% of each sale</p>
                  {price > 0 && (
                    <p className="text-xs text-muted-foreground">
                      USD {amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          Integration
        </h2>
        <div className="rounded-xl border bg-white p-6 flex flex-col gap-4">
          {[
            { label: "Sales Page URL *", value: integration.websiteUrl },
            { label: "Thank You Page URL *", value: integration.thankYouUrl },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-blue-600 underline">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onEdit}
          variant="outline"
          className="h-11 px-6 gap-2 rounded-md font-semibold border-gray-200 text-foreground hover:border-[#F97316] hover:text-[#F97316]"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit changes
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="h-11 px-10 gap-2 rounded-md font-semibold bg-[#F97316] text-white hover:bg-[#F97316]/90"
        >
          {submitting ? (
            <>
              <Spinner /> Submitting…
            </>
          ) : (
            <>
              Submit <IconArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Success modal ────────────────────────────────────────────────────────────

function SuccessModal({ link, onDone }: { link: string; onDone: () => void }) {
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
          onClick={onDone}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>
        <div className="flex justify-center mb-5">
          <div className="flex items-center justify-center size-28">
            <svg viewBox="0 0 120 100" className="w-full h-full" fill="none">
              <circle cx="35" cy="20" r="10" fill="#1a1a1a" />
              <circle cx="85" cy="20" r="10" fill="#1a1a1a" />
              <line
                x1="35"
                y1="30"
                x2="35"
                y2="65"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="85"
                y1="30"
                x2="85"
                y2="65"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="35"
                y1="45"
                x2="20"
                y2="60"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="85"
                y1="45"
                x2="100"
                y2="60"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="35"
                y1="65"
                x2="25"
                y2="85"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="35"
                y1="65"
                x2="45"
                y2="85"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="85"
                y1="65"
                x2="75"
                y2="85"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="85"
                y1="65"
                x2="95"
                y2="85"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M35 30 Q55 10 85 30"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="60" cy="18" r="4" fill="#F97316" />
              <text x="10" y="15" fontSize="10" fill="#F97316">
                ★
              </text>
              <text x="100" y="15" fontSize="10" fill="#F97316">
                ★
              </text>
              <text x="55" y="8" fontSize="8" fill="#F97316">
                ✦
              </text>
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-foreground mb-5">
          Product Submitted for Approval!
        </h2>
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
        <p className="text-xs text-center text-muted-foreground mb-6">
          Paste this link into the 'Buy Now' button on your sales page.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={onDone}
            className="h-11 px-10 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] gap-2"
          >
            <IconCheck className="size-4 text-[#F97316]" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Create product flow ──────────────────────────────────────────────────────

function CreateProductPage({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (salesPageLink: string) => void;
}) {
  const { addProduct, actionLoading } = useReduxVendor();

  const [step, setStep] = useState<StepId>(1);
  const [identity, setIdentity] = useState<IdentityData>({
    name: "",
    category: "",
    description: "",
    images: [],
  });
  const [pricing, setPricing] = useState<PricingData>({ price: "" });
  const [integration, setIntegration] = useState<IntegrationData>({
    websiteUrl: "",
    thankYouUrl: "",
  });

  const handleSubmit = async () => {
    try {
      // Payload matches Omit<VendorProduct, "id" | "createdAt"> as expected by createProduct thunk.
      // The slice uses api.post (JSON), not multipart — images are URLs not File objects.
      // If your backend accepts base64 or pre-signed upload URLs, convert here before sending.
      const payload = {
        name: identity.name,
        description: identity.description,
        price: parseFloat(pricing.price),
        categoryName: identity.category,
        status: "PENDING_APPROVAL" as const,
        salesPageUrl: integration.websiteUrl,
        thankYouPageUrl: integration.thankYouUrl,
        // Convert File objects to object URLs for preview; swap for real upload URLs in production
        images: identity.images.map((f) => URL.createObjectURL(f)),
      };

      const result = await addProduct(payload);
      // salesPageUrl returned by API, fall back to what the vendor typed
      const link =
        result?.salesPageUrl ?? result?.websiteUrl ?? integration.websiteUrl;
      onSuccess(link);
    } catch {
      // error already toasted inside addProduct
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              Create a new {step === 1 ? "product" : "Product"}
            </h1>
          </div>
          <StepIndicator current={step} />
        </div>

        {step === 1 && (
          <StepIdentity
            data={identity}
            onChange={(d) => setIdentity((p) => ({ ...p, ...d }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepPricing
            data={pricing}
            onChange={(d) => setPricing((p) => ({ ...p, ...d }))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepIntegration
            data={integration}
            onChange={(d) => setIntegration((p) => ({ ...p, ...d }))}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepReview
            identity={identity}
            pricing={pricing}
            integration={integration}
            onEdit={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={actionLoading}
          />
        )}
      </div>
    </PageShell>
  );
}

// ─── Vendor products list ─────────────────────────────────────────────────────

function VendorProductsListPage({
  onCreateProduct,
  onViewProduct,
  banner,
  onDismissBanner,
}: {
  onCreateProduct: () => void;
  onViewProduct: (p: VendorProduct) => void;
  banner: { message: string; subtitle: string } | null;
  onDismissBanner: () => void;
}) {
  const { inventory, loading, error, total, loadInventory } = useReduxVendor();
  const [currentPage, setCurrentPage] = useState(1);

  // Load on mount and page change
  useEffect(() => {
    // loadInventory({ page: currentPage, limit: PAGE_SIZE });
    loadInventory();
  }, [currentPage, loadInventory]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const pendingCount = inventory.filter(
    (p) => p.status === "PENDING_APPROVAL" || p.status === "PENDING_REAPPROVAL",
  ).length;
  const activeCount = inventory.filter((p) => p.status === "ACTIVE").length;

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<VendorProduct>[] = [
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
      header: "Price (UGX)",
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

  const stats = [
    {
      title: "Total products",
      value: total ?? 0,
      change: undefined,
      icon: <IconPackage className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      change: undefined,
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Total sales",
      value: activeCount,
      change: undefined,
      icon: <IconTrendingUp className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: "—",
      change: undefined,
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

        {/* Success banner */}
        {banner && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border-l-4 border-l-green-500 border border-green-100 bg-green-50 px-5 py-4">
            <IconCheck className="mt-0.5 size-5 shrink-0 text-green-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900">
                {banner.message}
              </p>
              <p className="mt-0.5 text-xs text-green-700">{banner.subtitle}</p>
            </div>
            <button
              onClick={onDismissBanner}
              className="shrink-0 text-green-400 hover:text-green-600 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-md border-l-4 border-l-red-500 border border-red-100 bg-red-50 px-5 py-4">
            <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <p className="flex-1 text-sm font-semibold text-red-900">{error}</p>
            <button
              onClick={() =>
                loadInventory({ page: currentPage, limit: PAGE_SIZE })
              }
              className="shrink-0 text-xs font-semibold text-red-600 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* DataTable */}
        <div className="rounded-xl">
          <DataTable
            columns={columns}
            data={inventory}
            loading={loading}
            skeletonRows={8}
            title="All Products"
            description="Manage and monitor all products on the platform"
            headerAction={
              <Button
                onClick={onCreateProduct}
                className="h-9 gap-1.5 rounded-lg bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#F97316]/90"
              >
                Add Products
              </Button>
            }
            searchColumn="name"
            searchPlaceholder="Search"
            showFilters
            showSort
            sortLabel="Ascending"
            showSelection
            showPagination
            pageSize={PAGE_SIZE}
            total={total ?? 0}
            page={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            emptyState={
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="flex items-center justify-center p-6 h-48 w-48 border rounded-full bg-[#EFEFEF]">
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
                  Click "Add Products" to create your first product
                </p>
                <Button
                  onClick={onCreateProduct}
                  className="mt-4 h-9 w-3xs gap-1.5 rounded-md px-8 text-sm font-semibold text-white hover:bg-[#F97316]/90"
                >
                  Add Products
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "create" | "success";

export default function VendorProductsPage() {
  const [view, setView] = useState<View>("list");
  const [successLink, setSuccessLink] = useState("");
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);

  const { deselectProduct } = useReduxVendor();

  const handleViewProduct = useCallback((product: VendorProduct) => {
    // Wire to your product detail page / router as needed
    console.log("View product", (product as any).id);
  }, []);

  const handleCreateSuccess = useCallback((link: string) => {
    setSuccessLink(link);
    setView("success");
  }, []);

  const handleSuccessDone = useCallback(() => {
    setBanner({
      message: "Product submitted for approval!",
      subtitle: "You'll be notified once an admin reviews your submission.",
    });
    deselectProduct();
    setView("list");
  }, [deselectProduct]);

  if (view === "create") {
    return (
      <CreateProductPage
        onBack={() => setView("list")}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  return (
    <>
      <VendorProductsListPage
        onCreateProduct={() => setView("create")}
        onViewProduct={handleViewProduct}
        banner={banner}
        onDismissBanner={() => setBanner(null)}
      />
      {view === "success" && (
        <SuccessModal link={successLink} onDone={handleSuccessDone} />
      )}
    </>
  );
}
