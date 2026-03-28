"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
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
  IconChevronDown,
  IconCircleCheck,
  IconEye,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
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
import { useReduxCategories } from "@/hooks/useReduxCategories";
import { uploadImages } from "@/lib/uploadImage";
import type { VendorProduct } from "@/redux/slices/vendorProductsSlice";

function getProductName(p: VendorProduct): string {
  return (p as any).title ?? p.name ?? "—";
}

function getProductPrice(p: VendorProduct): number {
  return p.price ?? 0;
}

function getProductImage(p: VendorProduct): string | undefined {
  const imgs = (p as any).coverImages ?? p.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return undefined;
  const url = imgs[0];

  return typeof url === "string" && url.startsWith("http") ? url : undefined;
}

function getProductCategory(p: VendorProduct): string {
  return (p as any).category ?? p.categoryName ?? p.categoryId ?? "—";
}

function getProductStatus(p: VendorProduct): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending Approval",
    ACTIVE: "Active",
    PENDING_REAPPROVAL: "Pending re-approval",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    DELETED: "Deleted",
  };
  return map[p.status?.toUpperCase?.()] ?? p.status ?? "—";
}

const SIDEBAR_STYLE = {
  "--sidebar-width": "calc(var(--spacing) * 56)",
  "--header-height": "calc(var(--spacing) * 14)",
} as React.CSSProperties;

const PAGE_SIZE = 10;
const VENDOR_PERCENT = 70;
const AFFILIATE_PERCENT = 20;
const PLATFORM_PERCENT = 10;

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
        "relative overflow-hidden rounded-xl p-5 text-white shadow-sm",
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
          "flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed cursor-pointer transition-colors min-h-[260px]",
          dragging
            ? "border-[#F97316] bg-orange-50"
            : "border-gray-200 bg-white hover:border-[#F97316]/50",
        )}
      >
        <div className="flex items-center justify-center rounded-lg bg-[#F97316] p-3">
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
              className="relative size-20 rounded-lg overflow-hidden border border-gray-100"
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
                className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <IconX className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductImage({
  src,
  alt = "",
  className,
  fill = false,
  width,
  height,
}: {
  src: string | undefined;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className={cn("object-cover", className)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      unoptimized
      className={cn("object-cover", className)}
    />
  );
}

// ─── Form data types ──────────────────────────────────────────────────────────

interface IdentityData {
  title: string;
  categoryId: string;
  description: string;
  specifications: string;
  images: File[];
}

interface PricingData {
  price: string;
  commissionValue: string;
}

interface IntegrationData {
  salesPageUrl: string;
  thankYouPageUrl: string;
}

const URL_REGEX = /^https?:\/\/.+/;

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-0.5">
        {label} {required && <span className="text-[#F97316]">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {!hint && <div className="mb-1.5" />}
      {children}
    </div>
  );
}

// ─── Next button ──────────────────────────────────────────────────────────────

function NextBtn({
  disabled,
  onClick,
  label = "Next",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="flex justify-end mt-8">
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-11 px-10 gap-2 rounded-md font-semibold",
          !disabled
            ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
            : "bg-[#F97316]/30 text-white cursor-not-allowed pointer-events-none",
        )}
      >
        {label} <IconArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function StepIdentity({
  data,
  onChange,
  onNext,
  categoryOptions,
  categoriesLoading,
}: {
  data: IdentityData;
  onChange: (d: Partial<IdentityData>) => void;
  onNext: () => void;
  categoryOptions: { value: string; label: string }[];
  categoriesLoading: boolean;
}) {
  const isValid =
    data.title.trim().length > 0 &&
    data.categoryId &&
    data.description.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-md border bg-white p-6 flex flex-col gap-5">
        <Field label="Product Name" required>
          <Input
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Text input, max 100 chars"
            maxLength={100}
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </Field>
        <Field label="Category" required>
          <Select
            value={data.categoryId}
            onValueChange={(v) => onChange({ categoryId: v })}
          >
            <SelectTrigger className="min-h-11 w-full border-gray-200">
              <SelectValue
                placeholder={
                  categoriesLoading
                    ? "Loading categories…"
                    : "Select a category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Product Description"
          hint="Describe your product."
          required
        >
          <Textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={5}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#F97316]"
          />
        </Field>
        <Field
          label="Product Specifications"
          hint="What makes your product unique"
        >
          <Textarea
            value={data.specifications}
            onChange={(e) => onChange({ specifications: e.target.value })}
            rows={5}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#F97316]"
          />
        </Field>
      </div>

      <div className="rounded-md border bg-white p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Your Product Picture <span className="text-[#F97316]">*</span>
        </label>
        <ImageUploader
          images={data.images}
          onChange={(images) => onChange({ images })}
        />
      </div>

      <div className="lg:col-span-2">
        <NextBtn disabled={!isValid} onClick={onNext} />
      </div>
    </div>
  );
}

function StepPricing({
  data,
  onChange,
  onNext,
}: {
  data: PricingData;
  onChange: (d: Partial<PricingData>) => void;
  onNext: () => void;
}) {
  const price = parseFloat(data.price) || 0;
  const isValid = price > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <Field label="Price Amount (USD)" required>
            <Input
              type="number"
              value={data.price}
              onChange={(e) => onChange({ price: e.target.value })}
              placeholder="Enter price, decimals are allowed"
              className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
            />
          </Field>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <IconAlertCircle className="size-4 text-gray-500 shrink-0" />
            <p className="text-sm font-bold text-foreground">Disclaimer</p>
          </div>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">
                  Vendors receive {VENDOR_PERCENT}%
                </span>{" "}
                of each confirmed sale. Affiliate marketers earn{" "}
                {AFFILIATE_PERCENT}% commission per verified sale through their
                referral link.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">
                  Tek Affiliate retains {PLATFORM_PERCENT}%
                </span>{" "}
                to cover platform and operational costs.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-gray-400 shrink-0" />
              <span>
                All pay-outs are subject to verification and in accordance with
                our Affiliate Policy.{" "}
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

      <div className="rounded-md border border-gray-200 bg-white p-6 flex flex-col gap-4">
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
          {
            label: "Platform Fee",
            pct: PLATFORM_PERCENT,
            amount: (price * PLATFORM_PERCENT) / 100,
          },
        ].map(({ label, pct, amount }) => (
          <div key={label}>
            <p className="text-sm font-normal text-foreground mb-2">{label}</p>
            <div className="rounded-md border bg-[#F7F7F7] p-3">
              <p className="text-xl font-semibold text-foreground">
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

      <div className="lg:col-span-2">
        <NextBtn disabled={!isValid} onClick={onNext} />
      </div>
    </div>
  );
}

function StepIntegration({
  data,
  onChange,
  onNext,
}: {
  data: IntegrationData;
  onChange: (d: Partial<IntegrationData>) => void;
  onNext: () => void;
}) {
  const isValid =
    URL_REGEX.test(data.salesPageUrl) && URL_REGEX.test(data.thankYouPageUrl);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border bg-white p-6 flex flex-col gap-5">
        <Field label="Website URL" required>
          <Input
            value={data.salesPageUrl}
            onChange={(e) => onChange({ salesPageUrl: e.target.value })}
            placeholder="Enter a valid URL format"
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </Field>
        <Field label="Thank You Page URL" required>
          <Input
            value={data.thankYouPageUrl}
            onChange={(e) => onChange({ thankYouPageUrl: e.target.value })}
            placeholder="Enter a valid URL format"
            className="h-11 border-gray-200 focus-visible:ring-[#F97316]"
          />
        </Field>
      </div>
      <NextBtn disabled={!isValid} onClick={onNext} />
    </div>
  );
}

function StepReview({
  identity,
  pricing,
  integration,
  onEdit,
  onSubmit,
  submitting,
  getCategoryLabel,
}: {
  identity: IdentityData;
  pricing: PricingData;
  integration: IntegrationData;
  onEdit: () => void;
  onSubmit: () => void;
  submitting: boolean;
  getCategoryLabel: (id: string) => string;
}) {
  const price = parseFloat(pricing.price) || 0;

  const previewBlobUrl = identity.images[0]
    ? URL.createObjectURL(identity.images[0])
    : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Identity */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-3">Identity</h2>
        <div className="rounded-md grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Product Name *
              </p>
              <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-foreground">
                {identity.title}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category *</p>
              <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-foreground">
                {getCategoryLabel(identity.categoryId)}
                <IconChevronDown className="size-4 text-gray-300" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Product Description *
              </p>
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-foreground min-h-[100px] whitespace-pre-wrap leading-relaxed">
                {identity.description}
              </div>
            </div>
            {identity.specifications && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Product Specifications
                </p>
                <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-foreground min-h-[100px] whitespace-pre-wrap leading-relaxed">
                  {identity.specifications}
                </div>
              </div>
            )}
          </div>

          <div className="border p-4 rounded-lg bg-white">
            {previewBlobUrl ? (
              <div className="rounded-md overflow-hidden border border-gray-100 aspect-[4/3] bg-gray-50 relative">
                <img
                  src={previewBlobUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 aspect-[4/3] flex items-center justify-center">
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
      </section>

      {/* Pricing */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-3">Pricing</h2>
        <div className="rounded-md grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 border p-4 rounded-lg bg-white">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Price Amount (USD) *
              </p>
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-foreground">
                {pricing.price}
              </div>
            </div>
            <div className="rounded-md border border-gray-300 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IconAlertCircle className="size-4 text-gray-400" />
                <p className="text-xs font-bold text-foreground">Disclaimer</p>
              </div>
              <div className="flex flex-col space-y-2.5 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="mt-1 size-1 rounded-full bg-gray-400 shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">
                      Vendors receive {VENDOR_PERCENT}%
                    </span>{" "}
                    of each confirmed sale. Affiliate marketers earn{" "}
                    {AFFILIATE_PERCENT}% commission per verified sale.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 size-1 rounded-full bg-gray-400 shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">
                      Tek Affiliate retains {PLATFORM_PERCENT}%
                    </span>{" "}
                    to cover platform and operational costs.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 size-1 rounded-full bg-gray-400 shrink-0" />
                  <span>
                    All pay-outs are subject to verification.{" "}
                    <a href="#" className="text-blue-500 underline">
                      please read the policy
                    </a>{" "}
                    or contact support.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border p-4 rounded-lg bg-white">
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
              {
                label: "Platform Fee",
                pct: PLATFORM_PERCENT,
                amount: (price * PLATFORM_PERCENT) / 100,
              },
            ].map(({ label, pct, amount }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
                <div className="rounded-md border bg-gray-50 p-3">
                  <p className="text-md font-bold">{pct}% of each sale</p>
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
      </section>

      {/* Integration */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-3">
          Integration
        </h2>
        <div className="rounded-md border bg-white p-6 flex flex-col gap-4">
          {[
            { label: "Sales Page URL *", value: integration.salesPageUrl },
            {
              label: "Thank You Page URL *",
              value: integration.thankYouPageUrl,
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-blue-600 underline break-all">
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
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
              <Spinner /> Uploading & Submitting…
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
          <div className="relative h-36 w-46 flex items-center justify-center">
            {/* Local public asset — plain <img> is fine */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/success.png"
              alt=""
              className="w-full h-full object-cover"
            />
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
            className="h-11 px-10 rounded-md font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] gap-2"
          >
            <IconCircleCheck className="size-4 text-[#F97316]" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateProductPage({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (salesPageLink: string) => void;
}) {
  const { addProduct, actionLoading } = useReduxVendor();
  const {
    categoryOptions,
    loading: categoriesLoading,
    getCategoryLabel,
    loadCategories,
  } = useReduxCategories();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [step, setStep] = useState<StepId>(1);
  const [identity, setIdentity] = useState<IdentityData>({
    title: "",
    categoryId: "",
    description: "",
    specifications: "",
    images: [],
  });
  const [pricing, setPricing] = useState<PricingData>({
    price: "",
    commissionValue: "",
  });
  const [integration, setIntegration] = useState<IntegrationData>({
    salesPageUrl: "",
    thankYouPageUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    try {
      let coverImages: string[] = [];
      if (identity.images.length > 0) {
        setUploading(true);
        try {
          coverImages = await uploadImages(identity.images);
        } catch (uploadErr: any) {
          toast.error(
            uploadErr?.message ?? "Image upload failed. Please try again.",
          );
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        title: identity.title,
        categoryId: identity.categoryId,
        price: parseFloat(pricing.price),
        commissionValue:
          parseFloat(pricing.commissionValue) || AFFILIATE_PERCENT,
        salesPageUrl: integration.salesPageUrl,
        thankYouPageUrl: integration.thankYouPageUrl,
        coverImages,
      };

      const result = await addProduct(payload);
      const link = result?.salesPageUrl ?? integration.salesPageUrl;
      onSuccess(link);
    } catch {}
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-foreground hover:text-[#F97316] transition-colors"
            >
              <IconArrowLeft className="size-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">
              Create a new product
            </h1>
          </div>
          <StepIndicator current={step} />
        </div>

        {step === 1 && (
          <StepIdentity
            data={identity}
            onChange={(d) => setIdentity((p) => ({ ...p, ...d }))}
            onNext={() => setStep(2)}
            categoryOptions={categoryOptions}
            categoriesLoading={categoriesLoading}
          />
        )}
        {step === 2 && (
          <StepPricing
            data={pricing}
            onChange={(d) => setPricing((p) => ({ ...p, ...d }))}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepIntegration
            data={integration}
            onChange={(d) => setIntegration((p) => ({ ...p, ...d }))}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepReview
            identity={identity}
            pricing={pricing}
            integration={integration}
            onEdit={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={uploading || actionLoading}
            getCategoryLabel={getCategoryLabel}
          />
        )}
      </div>
    </PageShell>
  );
}

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

  useEffect(() => {
    loadInventory();
  }, [currentPage, loadInventory]);

  const pendingCount = inventory.filter(
    (p) => p.status === "PENDING_APPROVAL" || p.status === "PENDING_REAPPROVAL",
  ).length;
  const activeCount = inventory.filter((p) => p.status === "ACTIVE").length;

  const columns: ColumnDef<VendorProduct>[] = [
    {
      id: "picture",
      header: "Picture",
      cell: ({ row }) => {
        const src = getProductImage(row.original);
        return (
          <div className="size-10 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center relative">
            {src ? (
              <Image
                src={src}
                alt={getProductName(row.original)}
                fill
                unoptimized
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <IconPackage className="size-5 text-gray-300" />
            )}
          </div>
        );
      },
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
      header: "Price (USD)",
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
      change: "+15%",
      icon: <IconPackage className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      change: "+5%",
      icon: <IconClock className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#e07820] to-[#c96810]",
    },
    {
      title: "Total sales",
      value: activeCount,
      change: "+5%",
      icon: <IconTrendingUp className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Net Revenue",
      value: "—",
      change: "+5%",
      icon: <IconCurrencyDollar className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
        <h1 className="mb-5 text-2xl font-bold text-foreground">Products</h1>

        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {banner && (
          <div className="mb-5 flex items-start gap-3 rounded-md border-l-4 border-l-green-500 border border-green-100 bg-green-50 px-5 py-4">
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
                {/* Local public asset */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                className="mt-4 h-9 gap-1.5 rounded-md px-8 text-sm font-semibold text-white hover:bg-[#F97316]/90"
              >
                Add Products
              </Button>
            </div>
          }
        />
      </div>
    </PageShell>
  );
}

function DeleteProductModal({
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
      <div className="w-full max-w-[460px] rounded-2xl bg-[#fef8f0] p-10 shadow-2xl flex flex-col items-center text-center relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Trash-can with spinning papers illustration */}
        <div className="h-36 w-36 flex items-center justify-center mb-4">
          <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
            {/* Trash can body */}
            <rect
              x="42"
              y="68"
              width="76"
              height="68"
              rx="6"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            {/* Lid */}
            <rect
              x="34"
              y="56"
              width="92"
              height="14"
              rx="4"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            {/* Handle on lid */}
            <rect
              x="62"
              y="48"
              width="36"
              height="10"
              rx="5"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            {/* Recycle arrows on can */}
            <path
              d="M72 100 L80 88 L88 100 M80 88 L80 112"
              stroke="#1a1a1a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Flying papers */}
            <rect
              x="96"
              y="32"
              width="28"
              height="34"
              rx="3"
              stroke="#1a1a1a"
              strokeWidth="2"
              transform="rotate(15 96 32)"
            />
            <line
              x1="101"
              y1="42"
              x2="117"
              y2="42"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="101"
              y1="48"
              x2="117"
              y2="48"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="101"
              y1="54"
              x2="112"
              y2="54"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Motion lines */}
            <path
              d="M88 55 Q95 42 104 38"
              stroke="#1a1a1a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-foreground">
          Delete this Product?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-[300px]">
          This product will be deactivated and permanently deleted after 30
          days. This can be undone during that period.
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
            {isLoading ? <Spinner /> : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function ReinstateProductModal({
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
      <div className="w-full max-w-[460px] rounded-2xl bg-[#fef8f0] p-10 shadow-2xl flex flex-col items-center text-center relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border-2 border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Rocket + open box + person illustration */}
        <div className="h-40 w-40 flex items-center justify-center mb-4">
          <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
            {/* Open box */}
            <rect
              x="20"
              y="90"
              width="66"
              height="48"
              rx="4"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <path
              d="M20 104 L53 90 L86 104"
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
            />
            {/* Rocket in / above box */}
            <ellipse
              cx="53"
              cy="70"
              rx="10"
              ry="17"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <path
              d="M43 80 L37 96 L53 90 L69 96 L63 80"
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
            />
            <ellipse cx="53" cy="53" rx="10" ry="6" fill="#1a1a1a" />
            <path d="M43 53 Q53 38 63 53" fill="#1a1a1a" />
            <circle cx="53" cy="68" r="4" fill="#60a5fa" />
            {/* Flames */}
            <path
              d="M47 96 Q45 108 53 104 Q61 108 59 96"
              fill="#f97316"
              opacity="0.85"
            />
            <path d="M50 96 Q49 103 53 101 Q57 103 56 96" fill="#fbbf24" />
            {/* Person (right side) */}
            <circle cx="120" cy="60" r="12" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M120 72 L120 106" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M120 80 L106 72" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M120 82 L134 74" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M120 106 L110 124" stroke="#1a1a1a" strokeWidth="2" />
            <path d="M120 106 L130 124" stroke="#1a1a1a" strokeWidth="2" />
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
            {isLoading ? <Spinner /> : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorProductDetailView({
  product,
  onBack,
  onEdit,
}: {
  product: VendorProduct;
  onBack: () => void;
  onEdit: (p: VendorProduct) => void;
}) {
  const { deleteProduct, reinstate, deactivate, actionLoading } =
    useReduxVendor();

  const [status, setStatus] = useState(getProductStatus(product));
  const [statusOpen, setStatusOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [copiedSales, setCopiedSales] = useState(false);
  const [copiedThankYou, setCopiedThankYou] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "warning" | "info";
    message: string;
    subtitle?: string;
  } | null>(() => {
    const s = product.status?.toUpperCase?.();
    if (s === "DEACTIVATED") {
      return {
        type: "warning",
        message: "This product has been deactivated",
        subtitle: "It will be permanently deleted in 30 days",
      };
    }
    return null;
  });

  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const rawStatus = product.status?.toUpperCase?.() ?? "";
  const isActive = rawStatus === "ACTIVE";
  const isDeactivated = rawStatus === "DEACTIVATED";
  const isSuspended = rawStatus === "SUSPENDED";
  const isDeleted = rawStatus === "DELETED";

  const statusActions: {
    label: string;
    action: () => void;
    danger?: boolean;
  }[] = [];
  if (isActive) {
    statusActions.push({
      label: "Deactivate",
      action: handleDeactivate,
      danger: false,
    });
    statusActions.push({
      label: "Delete",
      action: () => {
        setStatusOpen(false);
        setShowDeleteModal(true);
      },
      danger: true,
    });
  } else if (isDeactivated) {
    statusActions.push({
      label: "Reinstate",
      action: () => {
        setStatusOpen(false);
        setShowReinstateModal(true);
      },
    });
    statusActions.push({
      label: "Delete",
      action: () => {
        setStatusOpen(false);
        setShowDeleteModal(true);
      },
      danger: true,
    });
  } else if (isSuspended) {
    statusActions.push({
      label: "Delete",
      action: () => {
        setStatusOpen(false);
        setShowDeleteModal(true);
      },
      danger: true,
    });
  }

  async function handleDeactivate() {
    setStatusOpen(false);
    try {
      await deactivate((product as any).id);
      setStatus("Deactivated");
      setNotification({
        type: "warning",
        message: "This product has been deactivated",
        subtitle: "It will be permanently deleted in 30 days",
      });
    } catch {}
  }

  async function handleDelete() {
    try {
      await deleteProduct((product as any).id);
      setShowDeleteModal(false);
      setStatus("Deleted");
      setNotification({
        type: "info",
        message: "This product has been deleted",
        subtitle: "It will be permanently removed in 30 days",
      });
    } catch {}
  }

  async function handleReinstate() {
    try {
      await reinstate((product as any).id);
      setShowReinstateModal(false);
      setStatus("Active");
      setNotification({
        type: "success",
        message: "This product has been reinstated",
        subtitle: "It is now active and will appear in the market place",
      });
    } catch {}
  }

  function copyToClipboard(text: string, which: "sales" | "thankyou") {
    navigator.clipboard.writeText(text).catch(() => {});
    if (which === "sales") {
      setCopiedSales(true);
      setTimeout(() => setCopiedSales(false), 2000);
    } else {
      setCopiedThankYou(true);
      setTimeout(() => setCopiedThankYou(false), 2000);
    }
  }

  const productName = getProductName(product);
  const category = getProductCategory(product);
  const subCategory = (product as any).subCategory ?? "";
  const coverImg = getProductImage(product);
  const extraImages: string[] = (() => {
    const imgs = (product as any).coverImages ?? product.images ?? [];
    return imgs
      .slice(1, 5)
      .filter((u: string) => typeof u === "string" && u.startsWith("http"));
  })();
  const price = getProductPrice(product);
  const currency = (product as any).currency ?? "USD";
  const commission =
    (product as any).affiliateCommission ??
    (product as any).commissionRate ??
    20;
  const description = (product as any).description ?? "";
  const specifications: string[] =
    (product as any).specifications ?? (product as any).details ?? [];
  const salesUrl =
    (product as any).salesPageUrl ?? (product as any).websiteUrl ?? "";
  const thankYouUrl = (product as any).thankYouPageUrl ?? "";

  const notifStyles = {
    success: {
      wrapper: "border-green-200 border-l-green-500 bg-green-50",
      icon: "text-green-500",
      title: "text-green-900",
      sub: "text-green-700",
    },
    warning: {
      wrapper: "border-amber-200 border-l-amber-500 bg-amber-50",
      icon: "text-amber-500",
      title: "text-amber-900",
      sub: "text-amber-700",
    },
    info: {
      wrapper: "border-blue-200 border-l-blue-500 bg-blue-50",
      icon: "text-blue-500",
      title: "text-blue-900",
      sub: "text-blue-700",
    },
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Product Details
          </h1>
        </div>

        <div className="rounded-xl border bg-white px-6 py-5 flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{productName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {category}
              {subCategory ? ` / ${subCategory}` : ""}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {notification &&
          (() => {
            const s = notifStyles[notification.type];
            return (
              <div
                className={cn(
                  "mb-4 flex items-start gap-3 rounded-xl border border-l-4 px-5 py-4",
                  s.wrapper,
                )}
              >
                {notification.type === "success" ? (
                  <IconCircleCheck
                    className={cn("mt-0.5 size-5 shrink-0", s.icon)}
                  />
                ) : notification.type === "warning" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn("mt-0.5 size-5 shrink-0", s.icon)}
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn("mt-0.5 size-5 shrink-0", s.icon)}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", s.title)}>
                    {notification.message}
                  </p>
                  {notification.subtitle && (
                    <p className={cn("text-xs mt-0.5", s.sub)}>
                      {notification.subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <IconX className="size-4" />
                </button>
              </div>
            );
          })()}

        <div className="rounded-xl border bg-white p-6 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-[4/3] flex items-center justify-center relative">
                {coverImg ? (
                  <Image
                    src={coverImg}
                    alt={productName}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <IconPackage className="size-12" />
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              {extraImages.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {extraImages.map((src, i) => (
                    <div
                      key={i}
                      className="size-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 relative shrink-0"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price</p>
                  <p className="text-xl font-bold text-foreground">
                    {currency} {price.toLocaleString()}
                  </p>
                </div>
                <div className="border-l border-gray-100 pl-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Affiliate Commission
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {commission}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              {description && (
                <>
                  <h3 className="text-base font-bold text-foreground mb-3">
                    Product description
                  </h3>
                  <div className="space-y-3 mb-6">
                    {description
                      .split("\n\n")
                      .map((para: string, i: number) => (
                        <p
                          key={i}
                          className="text-sm text-foreground leading-relaxed"
                        >
                          {para}
                        </p>
                      ))}
                  </div>
                </>
              )}

              {specifications.length > 0 && (
                <>
                  <h3 className="text-base font-bold text-foreground mb-3">
                    Product Specifications
                  </h3>
                  <ul className="space-y-1.5">
                    {specifications.map((spec: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 size-1.5 rounded-full bg-gray-600 shrink-0" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sales URLs */}
        <div className="rounded-xl border bg-white p-6 mb-4 space-y-5">
          {[
            {
              label: "Sales Page URL",
              url: salesUrl,
              copied: copiedSales,
              which: "sales" as const,
            },
            {
              label: "Thank You Page URL",
              url: thankYouUrl,
              copied: copiedThankYou,
              which: "thankyou" as const,
            },
          ].map(({ label, url, copied, which }) => (
            <div key={label}>
              <p className="text-sm font-medium text-foreground mb-1.5">
                {label} <span className="text-[#F97316]">*</span>
              </p>
              <div className="flex items-center gap-2">
                {/* URL display field */}
                <div className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-muted-foreground truncate">
                  {url || "—"}
                </div>
                {/* View button */}
                <a
                  href={url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-foreground hover:border-gray-300 transition-colors shrink-0"
                >
                  View <IconEye className="size-4" />
                </a>
                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(url, which)}
                  className="flex items-center gap-1.5 rounded-md bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <IconCheck className="size-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <IconCopy className="size-4" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isDeleted && (
          <div className="flex items-center justify-end gap-3">
            {/* Edit button */}
            <Button
              onClick={() => onEdit(product)}
              className="h-11 gap-2 px-6 rounded-md bg-[#F97316] text-white font-semibold hover:bg-[#F97316]/90"
            >
              Edit
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
            </Button>

            {/* Change Status dropdown */}
            {statusActions.length > 0 && (
              <div ref={statusRef} className="relative">
                <button
                  onClick={() => setStatusOpen((o) => !o)}
                  disabled={actionLoading}
                  className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors shadow-sm disabled:opacity-60 min-w-[160px]"
                >
                  {actionLoading ? (
                    <>
                      <Spinner /> Updating…
                    </>
                  ) : (
                    <>
                      <span>Change Status</span>
                      <IconChevronDown className="size-4 text-gray-400" />
                    </>
                  )}
                </button>

                {statusOpen && !actionLoading && (
                  <div className="absolute bottom-full right-0 mb-1 w-52 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden z-10">
                    {statusActions.map(({ label, action, danger }) => (
                      <button
                        key={label}
                        onClick={action}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors",
                          danger ? "text-red-500" : "text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteProductModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={actionLoading}
        />
      )}

      {/* Reinstate modal */}
      {showReinstateModal && (
        <ReinstateProductModal
          onClose={() => setShowReinstateModal(false)}
          onConfirm={handleReinstate}
          isLoading={actionLoading}
        />
      )}
    </PageShell>
  );
}

type VendorView = "list" | "create" | "success" | "detail";

export default function VendorProductsPage() {
  const [view, setView] = useState<VendorView>("list");
  const [successLink, setSuccessLink] = useState(
    "https://tekaffiliate.vercel.app/checkout",
  );
  const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(
    null,
  );
  const [banner, setBanner] = useState<{
    message: string;
    subtitle: string;
  } | null>(null);
  const { deselectProduct } = useReduxVendor();

  const handleViewProduct = useCallback((product: VendorProduct) => {
    setSelectedProduct(product);
    setView("detail");
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

  const handleEditProduct = useCallback((_product: VendorProduct) => {
    setView("create");
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setSelectedProduct(null);
    setView("list");
  }, []);

  if (view === "create") {
    return (
      <CreateProductPage
        onBack={() => setView("list")}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  if (view === "detail" && selectedProduct) {
    return (
      <VendorProductDetailView
        product={selectedProduct}
        onBack={handleBackFromDetail}
        onEdit={handleEditProduct}
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
