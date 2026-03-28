"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconCreditCard, IconBuildingBank } from "@tabler/icons-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "card" | "bank" | "googlepay";

interface CheckoutProduct {
  name: string;
  category: string;
  subCategory?: string;
  vendor: string;
  price: number;
  currency?: string;
  mainImage?: string;
  thumbnails?: string[];
  shipping?: number;
  taxRate?: number;
}

// ─── Default product (replace with real data / props) ─────────────────────────

const DEMO_PRODUCT: CheckoutProduct = {
  name: "Kampala Nites App",
  category: "Sofware & Apps",
  subCategory: "Mobile Apps",
  vendor: "Everything Africa",
  price: 12000,
  currency: "$",
  mainImage: "",
  thumbnails: ["", "", ""],
  shipping: 30,
  taxRate: 0.05,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number, currency = "$"): string {
  return `${currency} ${amount.toLocaleString()}`;
}

function calcTotal(product: CheckoutProduct) {
  const shipping = product.shipping ?? 0;
  const tax = Math.round(product.price * (product.taxRate ?? 0));
  const total = product.price + shipping + tax;
  return { shipping, tax, total };
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-[#F97316] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
    />
  );
}

function SelectInput({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Payment method tab ───────────────────────────────────────────────────────

function PaymentTab({
  method,
  label,
  icon,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
        selected
          ? "border-[#F97316] bg-orange-50 text-gray-800"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      )}
    >
      <span className={cn("shrink-0", selected ? "text-[#F97316]" : "text-gray-400")}>
        {icon}
      </span>
      <span className="leading-none">{label}</span>
      {/* Radio dot */}
      <span
        className={cn(
          "ml-auto flex size-5 items-center justify-center rounded-full border-2 transition-all",
          selected ? "border-[#F97316]" : "border-gray-300"
        )}
      >
        {selected && (
          <span className="size-2.5 rounded-full bg-[#1a1a1a]" />
        )}
      </span>
    </button>
  );
}

// ─── Google Pay icon ──────────────────────────────────────────────────────────

function GooglePayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none">
      <text x="0" y="16" fontSize="12" fontWeight="bold" fill="#4285F4">G</text>
    </svg>
  );
}

// ─── Product image placeholder ────────────────────────────────────────────────

function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center", className)}>
      <svg className="size-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

// ─── Checkout page ────────────────────────────────────────────────────────────

export default function CheckoutPage({
  product = DEMO_PRODUCT,
}: {
  product?: CheckoutProduct;
}) {
  const { shipping, tax, total } = calcTotal(product);
  const currency = product.currency ?? "$";

  // ── Form state ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("beyername@gmail.com");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("United States of America");
  const [shippingAddress, setShippingAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Bank
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");

  // Google Pay (same as card + extra PIN field)
  const [gpCardNumber, setGpCardNumber] = useState("1234 4566 2312 1453");
  const [gpExpiry, setGpExpiry] = useState("12/45");
  const [gpCvv, setGpCvv] = useState("343");
  const [gpPin, setGpPin] = useState("");

  const COUNTRIES = [
    "United States of America",
    "Uganda",
    "Kenya",
    "Tanzania",
    "United Kingdom",
    "Canada",
    "Australia",
  ];

  const BANKS = [
    "Equity Bank Uganda Limited",
    "Stanbic Bank Uganda",
    "Absa Bank Uganda",
    "DFCU Bank",
    "Centenary Bank",
    "Standard Chartered Uganda",
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Orange header bar ── */}
      <header className="bg-[#F97316] py-4 px-6 flex items-center justify-center shrink-0">
        <span className="text-white text-xl font-bold tracking-tight">
          Tek<span className="mx-1 opacity-60">|</span>Affiliate
        </span>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 py-8 px-4 lg:px-8">
        <div className="mx-auto max-w-[1020px] flex flex-col gap-5">

          {/* Product header card */}
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {product.category}{product.subCategory ? ` / ${product.subCategory}` : ""}
              </p>
            </div>
            <p className="text-sm text-gray-400 shrink-0 mt-0.5">By {product.vendor}</p>
          </div>

          {/* Two-column desktop layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-4">

              {/* Product image + thumbnails */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                {/* Main image */}
                <div className="rounded-lg overflow-hidden aspect-[4/3] w-full relative">
                  {product.mainImage ? (
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <ProductImagePlaceholder className="w-full h-full" />
                  )}
                </div>

                {/* Thumbnail strip */}
                {(product.thumbnails ?? []).length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {(product.thumbnails ?? []).slice(0, 4).map((src, i) => (
                      <div
                        key={i}
                        className="size-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 relative shrink-0"
                      >
                        {src ? (
                          <Image
                            src={src}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <ProductImagePlaceholder className="w-full h-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price card */}
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-3">
                <span className="text-sm text-gray-500 font-medium">Price:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {fmt(product.price, currency)}
                </span>
              </div>

              {/* Order total card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="text-base font-bold text-gray-900 mb-4">Order Total</h2>
                <div className="space-y-3">
                  {[
                    { label: "Subtotal", value: fmt(product.price, currency) },
                    { label: "Shipping", value: fmt(shipping, currency) },
                    { label: `Tax (${((product.taxRate ?? 0) * 100).toFixed(0)}%)`, value: fmt(tax, currency) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-sm text-gray-700">{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-6">

              {/* Contact Information */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">Contact Information</h2>
                <Field label="Email" required>
                  <TextInput
                    placeholder="beyername@gmail.com"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                </Field>
              </div>

              {/* Shipping Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Shipping Information</h2>
                  <button className="text-sm font-medium text-[#F97316] hover:underline">
                    Change
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <Field label="Full name" required>
                    <TextInput
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={setFullName}
                    />
                  </Field>
                  <Field label="Country">
                    <SelectInput
                      placeholder="United States of America"
                      options={COUNTRIES}
                      value={country}
                      onChange={setCountry}
                    />
                  </Field>
                  <Field label="Shipping address" required>
                    <TextInput
                      placeholder="Enter your shipping address"
                      value={shippingAddress}
                      onChange={setShippingAddress}
                    />
                  </Field>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
                  <button className="text-sm font-medium text-[#F97316] hover:underline">
                    Change
                  </button>
                </div>

                {/* Method tabs */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <PaymentTab
                    method="card"
                    label="Card"
                    icon={<IconCreditCard className="size-4" />}
                    selected={paymentMethod === "card"}
                    onSelect={() => setPaymentMethod("card")}
                  />
                  <PaymentTab
                    method="bank"
                    label="Bank"
                    icon={<IconBuildingBank className="size-4" />}
                    selected={paymentMethod === "bank"}
                    onSelect={() => setPaymentMethod("bank")}
                  />
                  <PaymentTab
                    method="googlepay"
                    label="Google Pay"
                    icon={
                      <svg viewBox="0 0 24 24" className="size-4" fill="none">
                        <circle cx="12" cy="12" r="10" fill="white" stroke="#e5e7eb" />
                        <text x="7" y="16" fontSize="10" fontWeight="800" fill="#4285F4">G</text>
                      </svg>
                    }
                    selected={paymentMethod === "googlepay"}
                    onSelect={() => setPaymentMethod("googlepay")}
                  />
                </div>

                {/* ── Card fields ── */}
                {paymentMethod === "card" && (
                  <div className="flex flex-col gap-4">
                    <Field label="Card Number" required>
                      <TextInput
                        placeholder="1234 1234 1234 1234"
                        value={cardNumber}
                        onChange={setCardNumber}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry date" required>
                        <TextInput
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={setExpiry}
                        />
                      </Field>
                      <Field label="Security code" required>
                        <TextInput
                          placeholder="CVV"
                          value={cvv}
                          onChange={setCvv}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Bank fields ── */}
                {paymentMethod === "bank" && (
                  <div className="flex flex-col gap-4">
                    <Field label="Bank">
                      <SelectInput
                        placeholder="Choose bank to pay from"
                        options={BANKS}
                        value={bank}
                        onChange={setBank}
                      />
                    </Field>
                    <Field label="Account Number" required>
                      <TextInput
                        placeholder="Your Account number"
                        value={accountNumber}
                        onChange={setAccountNumber}
                      />
                    </Field>
                    <Field label="PIN" required>
                      <TextInput
                        placeholder="MM/YY"
                        type="password"
                        value={pin}
                        onChange={setPin}
                      />
                    </Field>
                  </div>
                )}

                {/* ── Google Pay fields ── */}
                {paymentMethod === "googlepay" && (
                  <div className="flex flex-col gap-4">
                    <Field label="Card Number" required>
                      <TextInput
                        placeholder="1234 4566 2312 1453"
                        value={gpCardNumber}
                        onChange={setGpCardNumber}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry date" required>
                        <TextInput
                          placeholder="MM/YY"
                          value={gpExpiry}
                          onChange={setGpExpiry}
                        />
                      </Field>
                      <Field label="Security code" required>
                        <TextInput
                          placeholder="CVV"
                          value={gpCvv}
                          onChange={setGpCvv}
                        />
                      </Field>
                    </div>
                    <Field label="PIN" required>
                      <TextInput
                        placeholder="MM/YY"
                        type="password"
                        value={gpPin}
                        onChange={setGpPin}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Pay button */}
              <button
                type="button"
                className="w-full rounded-xl bg-[#1a1a1a] py-4 text-base font-bold text-white hover:bg-[#333] active:scale-[0.98] transition-all"
              >
                Pay {fmt(total, currency)}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 pb-4">
            See our{" "}
            <a href="#" className="underline text-gray-700 hover:text-[#F97316] transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline text-gray-700 hover:text-[#F97316] transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}