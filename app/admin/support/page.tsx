"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  IconArrowLeft,
  IconX,
  IconSend,
  IconChevronDown,
  IconMessageCircle,
  IconClipboardList,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "Resolved" | "Pending" | "Open" | "Processed";

interface TicketUser {
  name: string;
  role: string;
  initials?: string;
}

interface ChatMessage {
  id: string;
  sender: "admin" | "user" | "internal";
  senderName?: string;
  senderInitials?: string;
  text: string;
  timestamp?: string;
}

interface Ticket {
  id: string;
  ticketId: string;
  category: string;
  subject: string;
  description?: string;
  user: TicketUser;
  lastUpdated: string;
  status: TicketStatus;
  messages?: ChatMessage[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<TicketStatus, string> = {
  Resolved: "border border-green-400 text-green-600 bg-transparent",
  Pending: "border border-orange-300 text-orange-500 bg-transparent",
  Open: "border border-gray-400 text-gray-600 bg-transparent",
  Processed: "border border-teal-400 text-teal-600 bg-transparent",
};

const STATUS_ACTIONS: Record<TicketStatus, string[]> = {
  Resolved: ["Mark as Pending", "Mark as Open"],
  Pending: ["Mark as Resolved", "Mark as Open"],
  Open: ["Mark as Resolved", "Mark as Pending"],
  Processed: ["Mark as Resolved", "Mark as Pending"],
};

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 64)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

// ─── Telescope empty state ────────────────────────────────────────────────────

function TelescopeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="size-56 rounded-full bg-gray-100 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-40 h-40" fill="none">
          <circle cx="62" cy="55" r="22" fill="#1a1a1a" />
          <text x="62" y="63" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white">?</text>
          <rect x="70" y="90" width="50" height="12" rx="3" fill="#1a1a1a" transform="rotate(-30 70 90)" />
          <rect x="82" y="104" width="38" height="10" rx="3" fill="#1a1a1a" transform="rotate(-30 82 104)" />
          <line x1="95" y1="125" x2="80" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="125" x2="95" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="125" x2="110" y2="148" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          {([[112, 55], [125, 70], [118, 42]] as [number, number][]).map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="14" fill="#1a1a1a">+</text>
          ))}
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-2">Nothing here yet!</h3>
      <p className="text-sm text-muted-foreground text-center">
        Once users start sending in support tickets, they will appear here.
      </p>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TICKETS: Ticket[] = [
  {
    id: "1", ticketId: "TK-00290", category: "Marketing", subject: "Link not active",
    user: { name: "Victor Wandulu", role: "Affiliate Marketer", initials: "VW" },
    lastUpdated: "11/05/2026", status: "Resolved",
    description: "I hope you're doing well.\n\nI'd like to get some clarity regarding the current number of affiliate marketers on the platform. Could you please confirm the total number of active affiliates, and if possible, provide a breakdown of their status (active, inactive, or pending)?\n\nThis information will help guide planning and decision-making on our end.\n\nLooking forward to your response.\n\nRegards",
    messages: [
      { id: "m1", sender: "admin", senderName: "Admin", text: "Hi Raymond, Thanks for reaching out.\n\nWe currently have [X] affiliate marketers on the platform. Out of these, [X] are active, [X] are inactive, and [X] are pending. Let me know if you need a more detailed breakdown." },
      { id: "m2", sender: "user", senderName: "You", senderInitials: "VW", text: "Hi, Thanks for the update, I appreciate it. I'll review this and reach out in case I need any further details." },
      { id: "m3", sender: "internal", senderName: "Admin", text: "Kindly look into this @johnsmith" },
    ],
  },
  { id: "2", ticketId: "TK-00289", category: "Authentication", subject: "Link not active", user: { name: "World of Africa", role: "Vendor", initials: "WA" }, lastUpdated: "11/05/2026", status: "Pending", messages: [] },
  { id: "3", ticketId: "TK-00288", category: "Payments", subject: "Link not active", user: { name: "Asiimwe Godwin", role: "Affiliate Marketer", initials: "AG" }, lastUpdated: "11/05/2026", status: "Open", messages: [] },
  { id: "4", ticketId: "TK-00287", category: "Payments", subject: "Link not active", user: { name: "Innocent Ademon", role: "Affiliate Marketer", initials: "IA" }, lastUpdated: "10/05/2026", status: "Resolved", messages: [] },
  { id: "5", ticketId: "TK-00286", category: "Payments", subject: "Link not active", user: { name: "Muthoni Angella", role: "Affiliate Marketer", initials: "MA" }, lastUpdated: "10/05/2026", status: "Resolved", messages: [] },
  { id: "6", ticketId: "TK-00285", category: "Products", subject: "Link not active", user: { name: "Webina Lawson", role: "Affiliate Marketer", initials: "WL" }, lastUpdated: "10/05/2026", status: "Resolved", messages: [] },
  { id: "7", ticketId: "TK-00284", category: "Products", subject: "Link not active", user: { name: "Khalid Aucho", role: "Vendor", initials: "KA" }, lastUpdated: "10/05/2026", status: "Processed", messages: [] },
  { id: "8", ticketId: "TK-00283", category: "Payments", subject: "Link not active", user: { name: "Quincy Maine", role: "Vendor", initials: "QM" }, lastUpdated: "10/05/2026", status: "Open", messages: [] },
  { id: "9", ticketId: "TK-00282", category: "Security", subject: "Link not active", user: { name: "Yvette Mandela", role: "Vendor", initials: "YM" }, lastUpdated: "10/05/2026", status: "Pending", messages: [] },
  { id: "10", ticketId: "TK-00281", category: "Security", subject: "Link not active", user: { name: "Mulutta Peter", role: "Affiliate Marketer", initials: "MP" }, lastUpdated: "10/05/2026", status: "Pending", messages: [] },
];

const PAGE_SIZE = 10;

// ─── Ticket detail / chat view ────────────────────────────────────────────────

function TicketDetailView({
  ticket,
  onBack,
}: {
  ticket: Ticket;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [statusOpen, setStatusOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(ticket.messages ?? []);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusChange = (action: string) => {
    const map: Record<string, TicketStatus> = {
      "Mark as Resolved": "Resolved",
      "Mark as Pending": "Pending",
      "Mark as Open": "Open",
    };
    if (map[action]) setStatus(map[action]);
    setStatusOpen(false);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: isInternalNote ? "internal" : "admin",
      senderName: "Admin",
      text: replyText.trim(),
    };
    setMessages((prev) => [...prev, msg]);
    setReplyText("");
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* ← Support page title */}
        <div className="mb-5 flex items-center gap-2">
          <button onClick={onBack} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col gap-4">

            {/* Ticket header card */}
            <div className="rounded-xl border bg-white px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Ticket ID : {ticket.ticketId}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  By {ticket.user.name} ({ticket.user.role})
                </p>
              </div>
              <TicketStatusBadge status={status} />
            </div>

            {/* Subject + Description card */}
            <div className="rounded-xl border bg-white px-6 py-6 flex-1">
              <h3 className="text-base font-bold text-foreground mb-2">Subject</h3>
              <p className="text-sm text-foreground mb-6">{ticket.subject}</p>
              <h3 className="text-base font-bold text-foreground mb-3">Description</h3>
              {ticket.description ? (
                <div className="space-y-3">
                  {ticket.description.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-foreground leading-relaxed">{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided.</p>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex flex-col gap-4">

            {/* Change Status dropdown */}
            <div ref={statusRef} className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-foreground hover:border-gray-300 transition-colors shadow-sm"
              >
                Change Status
                <IconChevronDown className={cn("size-4 text-gray-400 transition-transform", statusOpen && "rotate-180")} />
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-100 bg-white shadow-xl z-10 overflow-hidden">
                  {STATUS_ACTIONS[status].map((action) => (
                    <button
                      key={action}
                      onClick={() => handleStatusChange(action)}
                      className="w-full px-5 py-3 text-left text-sm text-foreground hover:bg-gray-50 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat thread */}
            <div className="rounded-xl border bg-white flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[420px]">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No messages yet. Start the conversation below.
                  </p>
                )}

                {messages.map((msg) => {
                  if (msg.sender === "admin") {
                    return (
                      <div key={msg.id} className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">{msg.senderName}</span>
                          <div className="size-7 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gray-100 px-4 py-3">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === "user") {
                    return (
                      <div key={msg.id} className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="relative size-7 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{msg.senderInitials ?? "U"}</span>
                            <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 border border-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">{msg.senderName}</span>
                        </div>
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === "internal") {
                    return (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="size-7 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-muted-foreground">{msg.senderName}</span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm font-medium text-[#F97316]">Internal note</span>
                        </div>
                        <div className="w-full rounded-2xl bg-[#F97316] px-5 py-3.5">
                          <p className="text-sm text-white leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply box */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isInternalNote ? "Write an internal note…" : "Write a reply…"}
                    rows={3}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]/40 transition-all"
                  />
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isInternalNote}
                        onCheckedChange={setIsInternalNote}
                        className="data-[state=checked]:bg-[#F97316]"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Internal note</span>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-all",
                        replyText.trim() ? "bg-[#F97316] hover:bg-[#F97316]/90" : "bg-[#F97316]/40 cursor-not-allowed"
                      )}
                    >
                      Send note <IconSend className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Support list page ────────────────────────────────────────────────────────

function SupportListPage({
  tickets,
  onViewTicket,
}: {
  tickets: Ticket[];
  onViewTicket: (t: Ticket) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Derived counts for SectionCards
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(
    (t) => t.status === "Pending" || t.status === "Open"
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;

  // ── Column definitions for DataTable ──────────────────────────────────────
  const columns: ColumnDef<Ticket>[] = [
    {
      id: "ticketId",
      accessorKey: "ticketId",
      header: "Ticket ID",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.ticketId}</span>
      ),
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.category}</span>
      ),
    },
    {
      id: "subject",
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.subject}</span>
      ),
    },
    {
      id: "user",
      accessorFn: (t) => t.user.name,
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.user.role}</p>
        </div>
      ),
    },
    {
      id: "lastUpdated",
      accessorKey: "lastUpdated",
      header: "Last updated",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.lastUpdated}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => onViewTicket(row.original)}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-[#F97316] transition-colors"
        >
          <IconMessageCircle className="size-4" />
          Chat
        </button>
      ),
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">

        {/* Page title */}
        <h1 className="mb-5 text-2xl font-bold text-foreground">Support</h1>

        {/* ── 3 stat cards via SectionCards ──
            SectionCards is designed for 4 cards (vendors/marketers/products/revenue).
            We pass custom data to repurpose the first 3 slots for support stats,
            and hide the 4th by overriding to a 3-col grid wrapper. */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Total Support Tickets",
              value: totalTickets.toLocaleString(),
              change: "+15%",
              gradient: "from-[#F97316] to-[#FB923C]",
            },
            {
              title: "Pending Support Tickets",
              value: pendingTickets.toLocaleString(),
              change: "+5%",
              gradient: "from-[#92400E] to-[#B45309]",
            },
            {
              title: "Resolved Support Tickets",
              value: resolvedTickets.toLocaleString(),
              change: "+5%",
              gradient: "from-[#C2410C] to-[#EA580C]",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={cn(
                "relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-sm",
                card.gradient
              )}
            >
              {/* Decorative wave lines — identical to SectionCards */}
              <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0 60 Q50 30 100 55 T200 45" fill="none" stroke="white" strokeWidth="1.5" />
                <path d="M0 75 Q60 45 120 65 T200 60" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0 90 Q70 60 130 80 T200 75" fill="none" stroke="white" strokeWidth="0.75" />
              </svg>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  {/* Ticket icon in white/20 pill — matches SectionCards iconBg */}
                  <div className="rounded-lg bg-white/20 p-2">
                    <IconClipboardList className="size-5 text-white" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                  {card.change && (
                    <p className="flex items-center gap-1 text-xs text-white/90 whitespace-nowrap ml-4">
                      {/* TrendingUp inline SVG to avoid re-importing */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                      {card.change}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DataTable — handles search, filters, sort, pagination, empty state */}
        <DataTable
          columns={columns}
          data={tickets}
          title="All Support Tickets"
          description="Track available tickets that need your attention"
          searchColumn="user"
          searchPlaceholder="Search"
          showFilters
          showSort
          sortLabel="Ascending"
          showSelection
          showPagination
          pageSize={PAGE_SIZE}
          total={tickets.length}
          page={currentPage}
          onPageChange={setCurrentPage}
          emptyState={<TelescopeEmptyState />}
        />
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "detail";

export default function SupportPage() {
  const [view, setView] = useState<View>("list");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Replace MOCK_TICKETS with your Redux hook data when available
  const tickets = MOCK_TICKETS;

  const handleViewTicket = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTicket(null);
    setView("list");
  }, []);

  if (view === "detail" && selectedTicket) {
    return <TicketDetailView ticket={selectedTicket} onBack={handleBack} />;
  }

  return <SupportListPage tickets={tickets} onViewTicket={handleViewTicket} />;
}