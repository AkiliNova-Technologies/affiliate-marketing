"use client";

import * as React from "react";
import { useState, useRef } from "react";
import {
  IconChevronDown,
  IconArrowRight,
  IconPaperclip,
  IconEye,
  IconSend,
  IconUpload,
  IconX,
  IconPhone,
  IconMessageCircle,
  IconHelp,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable, StatusBadge } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { MarketerAppSidebar } from "@/components/marketer-app-sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "Resolved" | "Pending" | "Open";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  lastUpdated: string;
  status: TicketStatus;
}

interface Message {
  sender: "admin" | "you";
  text: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// ── Marketer-specific FAQs ────────────────────────────────────────────────────
const FAQS = [
  {
    question: "Who can become an affiliate on TekAffiliate?",
    answer:
      "Anyone can become an affiliate on TekAffiliate — whether you're a blogger, social media influencer, content creator, or simply someone with an audience. You just need to sign up, get approved, and start sharing your unique referral links to earn commissions.",
  },
  {
    question: "How do I start earning as an affiliate?",
    answer:
      "Once your account is approved, browse the marketplace for products that match your audience. Generate your unique referral link for any product and share it on your platforms. Every confirmed purchase made through your link earns you a 20% commission, paid out automatically.",
  },
  {
    question: "How do I promote products?",
    answer:
      "You can promote products through any channel — social media posts, YouTube videos, blog articles, email newsletters, or direct messaging. Copy your unique referral link from the dashboard and embed it wherever your audience is most engaged.",
  },
  {
    question: "How can I track my performance?",
    answer:
      "Your dashboard gives you a real-time view of clicks, conversions, and earnings broken down by product and campaign. You can filter by date range and export reports to track which promotions are performing best.",
  },
  {
    question: "Do I need a website to become an affiliate?",
    answer:
      "No, a website is not required. You can promote products using social media accounts, messaging apps, email, or any other online channel where you have an audience. A website can help but is entirely optional.",
  },
];

const CATEGORIES = ["Inquiry", "Delivery", "Quality", "Billing", "Technical", "Other"];

const MOCK_TICKETS: Ticket[] = Array.from({ length: 20 }, (_, i) => {
  const num = 290 - i;
  const statuses: TicketStatus[] = ["Resolved", "Pending", "Open", "Resolved", "Resolved"];
  const categories = ["Delivery", "Quality", "Quality", "Quality", "Quality"];
  return {
    id: `TK-00${num}`,
    subject: "How is this product better...",
    category: categories[i % 5],
    lastUpdated: i < 2 ? "11/05/2026" : "10/05/2026",
    status: statuses[i % 5],
  };
});

const INITIAL_MESSAGES: Message[] = [
  {
    sender: "admin",
    text: "Hi, Thanks for reaching out.\n\nWe currently have [X] affiliate marketers on the platform. Out of these, [X] are active, [X] are inactive, and [X] are pending. Let me know if you need a more detailed breakdown.",
  },
  {
    sender: "you",
    text: "Hi, Thanks for the update, I appreciate it. I'll review this and reach out in case I need any further details.",
  },
  {
    sender: "admin",
    text: "Alright",
  },
];

const ITEMS_PER_PAGE = 10;

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

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

// ─── Help Tab ─────────────────────────────────────────────────────────────────

function HelpTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setOpenFaq((prev) => (prev === idx ? null : idx));

  return (
    <div className="space-y-4">
      {/* Contact cards */}
      <div className="rounded-xl border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-5">
          {/* Chat card */}
          <div className="rounded-xl bg-gray-100 p-5 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                <IconMessageCircle className="size-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  Chat with our agent
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Available from 6 AM to 8 PM GMT | 7 Days a Week (Except major holidays)
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
                <IconPhone className="size-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  Call our agent
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Available from 6 AM to 8 PM GMT | 7 Days a Week (Except major holidays)
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">Toll free(UG):</span>{" "}
                    <a href="tel:+256774058454" className="text-[#F97316] underline underline-offset-2">
                      + 256 774 058 454
                    </a>
                  </p>
                  <p className="text-xs text-foreground">
                    <span className="font-medium">International:</span>{" "}
                    <a href="tel:+256774058454" className="text-[#F97316] underline underline-offset-2">
                      + 256 774 058 454
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms link */}
        <p className="text-sm text-foreground">
          See our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[#F97316] transition-colors">
            Terms of Service and Privacy Policy
          </a>
        </p>
      </div>

      {/* FAQs — marketer-specific ─────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-bold text-foreground mb-1.5">FAQs by Marketers</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          Here are affiliate-facing FAQs tailored for marketers who want to earn commissions on TekAffiliate.
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
  );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────

function NewTicketForm({ onCancel }: { onCancel: () => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={30}
            placeholder="Text input, max 30 chars)."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-0.5">
            Description <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-[#F97316] mb-1.5">Describe your issue.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={7}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 resize-none"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Upload an attachment{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-10 cursor-pointer hover:border-[#F97316]/50 transition-colors"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#F97316]">
            <IconUpload className="size-5 text-white" />
          </div>
          {file ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <IconX className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm font-semibold text-foreground">Click to upload or drag and drop</span>
              <span className="text-xs text-muted-foreground">Max 10mb file size</span>
            </>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button className="flex items-center gap-2 rounded-md bg-[#F97316] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors">
          Send <IconSend className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Ticket Chat View ─────────────────────────────────────────────────────────

function TicketChatView({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "you", text: input.trim() }]);
    setInput("");
  };

  const attachments = [
    { name: "Terms & Conditions.docx" },
    { name: "Product images.png" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-foreground">Ticket ID : {ticket.id}</p>
          <p className="text-xs text-[#F97316]">Category : {ticket.category}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Subject</h3>
            <p className="text-sm text-muted-foreground">{ticket.subject}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I hope you're doing well.
              <br /><br />
              I'd like to get some clarity regarding commission tracking on the platform.
              Could you please confirm how referral conversions are being counted and if
              there are any pending payouts for my account?
              <br /><br />
              This will help me plan my upcoming campaigns better.
              <br /><br />
              Looking forward to your response.
              <br /><br />
              Regards
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Attachments</h3>
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.name}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <IconPaperclip className="size-4 text-gray-400" />
                    {att.name}
                  </div>
                  <button className="text-gray-400 hover:text-[#F97316] transition-colors">
                    <IconEye className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col gap-1", msg.sender === "you" ? "items-start" : "items-end")}>
                <span className="text-xs font-semibold text-muted-foreground px-1">
                  {msg.sender === "you" ? "You" : "Admin"}
                </span>
                <div className="max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line bg-gray-100 text-foreground">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
            />
            <button
              onClick={sendMessage}
              className="self-end flex items-center gap-1.5 rounded-md bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
            >
              Send <IconSend className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket table columns ─────────────────────────────────────────────────────

function useTicketColumns(onChat: (ticket: Ticket) => void): ColumnDef<Ticket, unknown>[] {
  return React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Ticket ID",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.id}</span>,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="text-muted-foreground max-w-[200px] truncate block">{row.original.subject}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.category}</span>,
      },
      {
        accessorKey: "lastUpdated",
        header: "Last updated",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastUpdated}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => onChat(row.original)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#F97316] transition-colors"
          >
            <IconMessageCircle className="size-4" /> Chat
          </button>
        ),
      },
    ],
    [onChat],
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

function SupportTab() {
  const [view, setView] = useState<"list" | "detail" | "new">("list");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleChat = React.useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView("detail");
  }, []);

  const columns = useTicketColumns(handleChat);

  if (view === "new") return <NewTicketForm onCancel={() => setView("list")} />;
  if (view === "detail" && selectedTicket) {
    return <TicketChatView ticket={selectedTicket} onBack={() => setView("list")} />;
  }

  return (
    <DataTable
      columns={columns}
      data={MOCK_TICKETS}
      title="Support Tickets"
      description="Track available tickets that need your attention"
      headerAction={
        <button
          onClick={() => setView("new")}
          className="flex items-center gap-2 rounded-md bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F97316]/90 transition-colors"
        >
          + New Ticket
        </button>
      }
      searchColumn="subject"
      searchPlaceholder="Search"
      showFilters
      showSort
      showSelection
      showPagination
      pageSize={ITEMS_PER_PAGE}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketerHelpSupportPage() {
  const [activeTab, setActiveTab] = useState<"help" | "support">("help");

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <MarketerAppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen w-full">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            {activeTab === "help" ? "Help & Support" : "Support"}
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveTab("help")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === "help"
                  ? "bg-[#F97316] text-white"
                  : "bg-white border border-gray-200 text-foreground hover:bg-gray-50"
              )}
            >
              <IconHelp size={16} /> Help
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === "support"
                  ? "bg-[#F97316] text-white"
                  : "bg-white border border-gray-200 text-foreground hover:bg-gray-50"
              )}
            >
              Support
            </button>
          </div>

          {/* Tab content */}
          <div className="w-full max-w-8xl">
            {activeTab === "help" ? <HelpTab /> : <SupportTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}