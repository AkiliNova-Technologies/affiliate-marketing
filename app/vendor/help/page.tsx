"use client";

import * as React from "react";
import { useState } from "react";
import { IconChevronDown, IconArrowRight } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import { cn } from "@/lib/utils";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    question: "Who can become a vendor on TekAffiliate?",
    answer:
      "Anyone with a legitimate product or service can become a vendor on TekAffiliate. You need to register an account, submit your business details for verification, and list your products. We accept vendors from various industries including digital products, physical goods, and services.",
  },
  {
    question: "How do I list my product on TekAffiliate?",
    answer:
      "To list a product, navigate to Product Inventory and click 'Add Products'. Fill in the product details including name, description, pricing, and upload images. Once submitted, your product will be reviewed by our team and activated within 24–48 hours.",
  },
  {
    question: "How do affiliates promote my products?",
    answer:
      "Affiliates generate unique referral links for your products and share them across their platforms — social media, blogs, email newsletters, and more. Every time a customer makes a purchase through an affiliate's link, the sale is tracked and both you and the affiliate are credited accordingly.",
  },
  {
    question: "How are commissions distributed?",
    answer:
      "Commissions are distributed automatically after a sale is confirmed. Vendors receive 70% of each sale, affiliates receive 20% as commission, and TekAffiliate retains 10% to cover platform and operational costs. Payouts are processed on a rolling basis subject to verification.",
  },
  {
    question: "Can multiple affiliates promote my product?",
    answer:
      "Yes! There is no limit to the number of affiliates who can promote your products. In fact, having more affiliates increases your product's reach and potential sales. Each affiliate has a unique tracking link so commissions are always attributed correctly.",
  },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left group"
      >
        <span
          className={cn(
            "text-sm font-semibold pr-4 transition-colors",
            isOpen ? "text-foreground" : "text-foreground group-hover:text-[#F97316]"
          )}
        >
          {question}
        </span>
        <IconChevronDown
          className={cn(
            "size-5 shrink-0 transition-transform duration-200 text-[#F97316]",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-5 pr-8">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorHelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) =>
    setOpenFaq((prev) => (prev === idx ? null : idx));

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
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen w-full ">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Settings</h1>

          <div className="w-full max-w-8xl">
            {/* Section heading */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Help & Support</h2>
              <p className="mt-0.5 text-sm text-[#F97316]">
                Access resources and contacts incase of any challenges
              </p>
            </div>

            {/* Support cards + terms */}
            <div className="rounded-xl border bg-card p-6 mb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-5">

                {/* Chat card */}
                <div className="rounded-xl bg-gray-100 p-5 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <svg
                        className="size-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        Chat with our agent
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Available from 6 AM to 8 PM GMT | 7 Days a Week (Except
                        major holidays)
                      </p>
                    </div>
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#F97316] py-3 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors">
                    Start chat <IconArrowRight className="size-4" />
                  </button>
                </div>

                {/* Call card */}
                <div className="rounded-xl bg-gray-100 p-5 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <svg
                        className="size-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        Call our agent
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Available from 6 AM to 8 PM GMT | 7 Days a Week
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row  gap-2">
                    <a
                      href="tel:+256123123456"
                      className="flex w-full items-center justify-center rounded-md bg-[#F97316] py-3 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
                    >
                      + 256 123 123 456
                    </a>
                    <a
                      href="tel:+256123123456"
                      className="flex w-full items-center justify-center rounded-md bg-[#F97316] py-3 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
                    >
                      + 256 123 123 456
                    </a>
                  </div>
                </div>
              </div>

              {/* Terms link */}
              <p className="text-sm text-foreground">
                See our{" "}
                <a
                  href="#"
                  className="underline underline-offset-2 hover:text-[#F97316] transition-colors"
                >
                  Terms of Service and Privacy Policy
                </a>
              </p>
            </div>

            {/* FAQs section */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-1.5">
                FAQs by Vendor
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                Here are vendor-specific FAQ questions and answers suitable for
                the TekAffiliate website. These focus on concerns vendors usually
                have before joining a marketplace.
              </p>

              <div>
                {FAQS.map((faq, idx) => (
                  <FaqItem
                    key={idx}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFaq === idx}
                    onToggle={() => toggleFaq(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}