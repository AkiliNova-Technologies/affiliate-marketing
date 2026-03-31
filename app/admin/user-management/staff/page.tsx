// app/admin/user-management/staff/page.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconEdit,
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserX,
  IconPhone,
  IconMail,
  IconCalendar,
  IconClock,
  IconChevronDown,
  IconCircleCheck,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge } from "@/components/data-table";
import { Switch } from "@/components/ui/switch";
import { Eye } from "lucide-react";

// ─── Redux ────────────────────────────────────────────────────────────────────
import { useReduxAdmin } from "@/hooks/useReduxAdmin";
import type { Staff } from "@/redux/slices/adminStaffSlice";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { toast } from "sonner";
import PhoneField from "@/components/PhoneField";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayStatus = "Active" | "Suspended" | "Deactivated" | "Pending";

function toDisplayStatus(s: string): DisplayStatus {
  const map: Record<string, DisplayStatus> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
    PENDING_ACTIVATION: "Pending",
  };
  return map[s?.toUpperCase()] ?? "Active";
}

function getFullName(s: Staff) {
  return [s.firstName, s.lastName].filter(Boolean).join(" ") || "—";
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
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
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
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold text-[#F97316]">
        Section {step === 1 ? "one" : "two"}
      </p>
      <div className="flex gap-2">
        <div className="h-1.5 flex-1 max-w-[130px] rounded-full bg-[#F97316]" />
        <div
          className={cn(
            "h-1.5 flex-1 max-w-[130px] rounded-full transition-all",
            step === 2 ? "bg-[#F97316]" : "bg-gray-200",
          )}
        />
      </div>
    </div>
  );
}

// ─── Permission tabs data ─────────────────────────────────────────────────────

const PERMISSION_TABS = [
  "User management",
  "Products",
  "Campaigns",
  "Revenue",
  "Support",
] as const;
type PermTab = (typeof PERMISSION_TABS)[number];

interface PermissionGroup {
  title: string;
  permissions: { key: string; label: string }[];
}

const PERMISSIONS_DATA: Record<PermTab, PermissionGroup[]> = {
  "User management": [
    {
      title: "Staff management",
      permissions: [
        { key: "createStaff", label: "Create Staff" },
        { key: "readDashboard", label: "Read dashboard" },
        { key: "updateStaff", label: "Update Staff" },
        { key: "suspendStaff", label: "Suspend Staff" },
        { key: "reinstateStaff", label: "Reinstate Staff" },
      ],
    },
    {
      title: "Vendor management",
      permissions: [
        { key: "createVendors", label: "Create Vendors" },
        { key: "vendorReadDashboard", label: "Read dashboard" },
        { key: "updateVendor", label: "Update Vendor" },
        { key: "suspendVendor", label: "Suspend Vendor" },
        { key: "reinstateVendor", label: "Reinstate Vendor" },
      ],
    },
    {
      title: "Marketer management",
      permissions: [
        { key: "marketerReadDashboard", label: "Read dashboard" },
        { key: "suspendMarketer", label: "Suspend Marketer" },
        { key: "reinstateMarketer", label: "Reinstate Marketer" },
      ],
    },
  ],
  Products: [
    {
      title: "Product management",
      permissions: [
        { key: "productReadDashboard", label: "Read dashboard" },
        { key: "updateProductStatus", label: "Update Product status" },
        { key: "suspendProduct", label: "Suspend Product" },
        { key: "reinstateProduct", label: "Reinstate Product" },
      ],
    },
  ],
  Campaigns: [
    {
      title: "Campaign management",
      permissions: [
        { key: "campaignReadDashboard", label: "Read dashboard" },
        { key: "suspendCampaign", label: "Suspend Campaign" },
        { key: "reinstateCampaign", label: "Reinstate Campaign" },
      ],
    },
  ],
  Revenue: [
    {
      title: "Payouts",
      permissions: [
        {
          key: "viewAllPayoutTransactions",
          label: "View all Payout transactions",
        },
        { key: "viewSinglePayoutDetails", label: "View single sales details" },
        { key: "changePayoutStatus", label: "Change Payout status" },
      ],
    },
    {
      title: "Sales",
      permissions: [
        {
          key: "viewAllSalesTransactions",
          label: "View all sales transactions",
        },
        { key: "viewSingleSalesDetails", label: "View single sales details" },
        { key: "changeSalesPayoutStatus", label: "Change Payout status" },
      ],
    },
  ],
  Support: [
    {
      title: "Support management",
      permissions: [
        { key: "supportReadDashboard", label: "Read dashboard" },
        { key: "updateTicketStatus", label: "Update ticket status" },
        { key: "respondToTickets", label: "Respond to tickets" },
      ],
    },
  ],
};

// ─── Permissions panel ────────────────────────────────────────────────────────

function PermissionsPanel({
  perms,
  onChange,
}: {
  perms: Record<string, boolean>;
  onChange: (key: string, val: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<PermTab>("User management");
  const groups = PERMISSIONS_DATA[activeTab];

  const allEnabled = (group: PermissionGroup) =>
    group.permissions.every((p) => perms[p.key]);

  const toggleAll = (group: PermissionGroup, val: boolean) => {
    group.permissions.forEach((p) => onChange(p.key, val));
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto overflow-y-hidden">
        {PERMISSION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab
                ? "text-foreground border-b-2 border-[#F97316] -mb-px font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground capitalize">
                {group.title}
              </h3>
              <div className="flex items-center gap-2">
                <Switch
                  checked={allEnabled(group)}
                  onCheckedChange={(v) => toggleAll(group, v)}
                  className="data-[state=checked]:bg-[#F97316]"
                />
                <span className="text-xs text-muted-foreground">
                  Enable all permissions
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3" />
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 mb-6">
              {group.permissions.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <Switch
                    checked={!!perms[p.key]}
                    onCheckedChange={(v) => onChange(p.key, v)}
                    className="data-[state=checked]:bg-[#F97316]"
                  />
                  <span className="text-sm text-foreground">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Success modal ────────────────────────────────────────────────────────────

function SuccessModal({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[460px] rounded-2xl bg-[#fef8f0] p-10 shadow-2xl flex flex-col items-center text-center">
        <div className="flex flex-col items-center justify-center gap-4 p-6 h-52 w-62">
          <img
            src="/success.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-base text-foreground font-medium">
          The user has been successfully created
        </p>
        <Button
          onClick={onDone}
          className="mt-7 h-11 px-10 rounded-md bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333] gap-2"
        >
          <IconCircleCheck className="size-4 text-[#F97316]" />
          Done
        </Button>
      </div>
    </div>
  );
}

// ─── Add Staff form ───────────────────────────────────────────────────────────

function AddStaffForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addStaff, staffActionLoading } = useReduxAdmin();
 
  const [step, setStep] = useState<1 | 2>(1);
  const [fn, setFn] = useState("");
  const [ln, setLn] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCc, setPhoneCc] = useState("256");
  const [phoneErr, setPhoneErr] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [nickname, setNickname] = useState("");
  // role & perms are kept in state for the UI on step 2,
  // but are NOT sent to the API (it doesn't accept them on creation).
  const [role, setRole] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean>>({});
 
  const s1ok =
    fn.trim() &&
    ln.trim() &&
    email.trim() &&
    !emailErr &&
    phone.trim() &&
    !phoneErr &&
    password.trim() &&
    !passwordErr;
 
  const validateEmail = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address");
    } else {
      setEmailErr("");
    }
  };
 
 
  const handlePerm = (key: string, val: boolean) => {
    setPerms((p) => ({ ...p, [key]: val }));
  };
 
  const handleSubmit = async () => {
    try {
      await addStaff({
        email,
        firstName: fn,
        lastName: ln,
        phone: phone.trim() ? `+${phoneCc}${phone.trim()}` : undefined,
      });
      onSuccess();
    } catch {
      // toast already shown inside addStaff
    }
  };
 
  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center gap-2">
          <button onClick={onClose} className="text-foreground hover:text-[#F97316] transition-colors">
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        </div>
 
        <div className="w-full rounded-xl border bg-white p-6">
          <StepBar step={step} />
 
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">Add Staff</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create a new staff member and assign them roles and permissions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={fn}
                    onChange={(e) => setFn(e.target.value)}
                    placeholder="Enter your first name"
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={ln}
                    onChange={(e) => setLn(e.target.value)}
                    placeholder="Enter your last name"
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">* {emailErr}</span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
                    onBlur={validateEmail}
                    placeholder="Enter your email"
                    className={cn(
                      "h-11 rounded-lg focus-visible:ring-[#F97316]",
                      emailErr ? "border-red-500" : "border-gray-300"
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone Number{" "}
                    {phoneErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">* {phoneErr}</span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <PhoneField
                    phone={phone}
                    setPhone={(v) => { setPhone(v); if (phoneErr) setPhoneErr(""); }}
                    cc={phoneCc}
                    setCc={setPhoneCc}
                  />
                  {phoneErr && (
                    <p className="mt-1 text-xs text-red-500">{phoneErr}</p>
                  )}
                </div>
              </div>
            </>
          )}
 
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">Assign Roles &amp; Permissions</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create a new staff member and assign them roles and permissions
              </p>
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Assign role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-gray-300 text-sm">
                    <SelectValue placeholder="Select a role from the drop down" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Product Moderator">Product Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-foreground mb-1">Custom Permissions</h3>
                <p className="text-sm text-muted-foreground mb-4">Assign users permissions</p>
                <PermissionsPanel perms={perms} onChange={handlePerm} />
              </div>
            </>
          )}
        </div>
 
        <div className="mt-6 flex justify-end">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!s1ok}
              className={cn(
                "h-11 px-10 gap-2 rounded-md font-semibold",
                s1ok
                  ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none"
              )}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconArrowLeft className="size-4" /> Back
              </button>
              <Button
                onClick={handleSubmit}
                disabled={staffActionLoading}
                className={cn(
                  "h-11 px-10 gap-2 rounded-md font-semibold",
                  !staffActionLoading
                    ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                    : "bg-[#F97316]/40 text-white cursor-not-allowed"
                )}
              >
                {staffActionLoading ? <><Spinner /> Creating…</> : "Create Staff"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Activity log types ───────────────────────────────────────────────────────

interface ActivityLogEntry {
  action: string;
  module: string;
  date: string;
}

// ─── Activity log empty state ─────────────────────────────────────────────────

function ActivityLogEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 bg-[#FFFFFF] w-full rounded-lg -my-4">
      <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
        <IconClock className="size-5 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-foreground">No activity yet</p>
      <p className="text-xs text-muted-foreground">
        Actions taken by this staff member will appear here
      </p>
    </div>
  );
}

// ─── Single staff view ────────────────────────────────────────────────────────

function SingleStaffView({
  staffId,
  onClose,
}: {
  staffId: string;
  onClose: () => void;
}) {
  const {
    loadStaffById,
    selectedStaff,
    staffLoading,
    staffActionLoading,
    suspendStaff,
    activateStaff,
    editStaff,
  } = useReduxAdmin();

  const [statusOpen, setStatusOpen] = useState(false);
  const [role, setRole] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    loadStaffById(staffId);
  }, [staffId]);

  // Sync role dropdown once the staff member loads.
  // API top-level `role` = system role ("STAFF"); assigned role may be in profile.type.
  useEffect(() => {
    if (selectedStaff) {
      const profileType = selectedStaff.profile?.type ?? "";
      const resolvedRole =
        profileType && profileType !== "STAFF"
          ? profileType
          : (selectedStaff.role ?? "");
      setRole(resolvedRole);
    }
  }, [selectedStaff]);

  if (staffLoading || !selectedStaff) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center min-h-screen bg-[#F7F7F7]">
          <Spinner className="size-8 text-[#F97316]" />
        </div>
      </PageShell>
    );
  }

  const staff = selectedStaff;
  const displayStatus = toDisplayStatus(staff.status);
  const initials =
    `${staff.firstName?.[0] ?? ""}${staff.lastName?.[0] ?? ""}`.toUpperCase();

  // Activity log — use real data from API when available, otherwise empty
  const activityLog: ActivityLogEntry[] = staff.activityLog ?? [];

  // Activity log columns for DataTable
  const activityColumns: ColumnDef<ActivityLogEntry>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.action}</span>
      ),
    },
    {
      accessorKey: "module",
      header: "Module",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.module}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.date}</span>
      ),
    },
  ];

  const handlePerm = (key: string, val: boolean) => {
    setPerms((p) => ({ ...p, [key]: val }));
  };

  const handleStatusAction = async (action: "Suspend" | "Activate") => {
    setStatusOpen(false);
    if (action === "Suspend") {
      await suspendStaff(staff.id);
    } else {
      await activateStaff(staff.id);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await editStaff(staff.id, { role, permissions: perms });
      setSavedBanner(true);
    } catch {
      // toast shown inside editStaff
    } finally {
      setSaving(false);
    }
  };

  // Derive available status actions from current status
  const statusActions: ("Suspend" | "Activate")[] = [];
  if (staff.status === "ACTIVE") statusActions.push("Suspend");
  if (staff.status === "SUSPENDED" || staff.status === "PENDING_ACTIVATION")
    statusActions.push("Activate");

  // Human-readable role label for display under avatar
  const displayRole =
    staff.profile?.type && staff.profile.type !== "STAFF"
      ? staff.profile.type
      : (staff.role ?? "Staff");

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        {/* ── Page header ── */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Staff Management
          </h1>
        </div>

        {/* ── Saved banner ── */}
        {savedBanner && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 border-l-4 border-l-blue-500 bg-blue-50 px-5 py-3.5">
            <svg
              className="size-5 shrink-0 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="flex-1 text-sm font-semibold text-blue-900">
              Changes to this user profile have been saved!
            </p>
            <button
              onClick={() => setSavedBanner(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="rounded-xl bg-white border border-gray-100 p-6 mb-5">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Avatar column */}
            <div className="flex flex-col items-center justify-start gap-2 sm:w-52 sm:min-w-[13rem] md:min-w-[16rem] lg:min-w-[26rem] sm:pr-8 pb-6 sm:pb-0">
              <div className="relative size-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                <span className="text-2xl font-bold text-gray-500">
                  {initials}
                </span>
                {displayStatus === "Active" && (
                  <span className="absolute bottom-0.5 right-0.5 size-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <svg
                      className="size-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-base font-semibold text-foreground text-center">
                {`${staff.firstName} ${staff.lastName}`}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {displayRole}
              </p>
              <StatusBadge status={displayStatus} />
            </div>

            {/* Vertical divider — only visible sm+ */}
            <div className="hidden sm:block w-px bg-gray-100 self-stretch mx-2" />

            {/* Contact info column */}
            <div className="flex-1 sm:pl-8">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Contact Info
              </h3>
              <div className="space-y-3">
                {[
                  {
                    Icon: IconPhone,
                    label: "Phone number",
                    value: staff.phone || staff.phoneNumber || "—",
                  },
                  {
                    Icon: IconMail,
                    label: "Email Address",
                    value: staff.email,
                  },
                  {
                    Icon: IconCalendar,
                    label: "Date joined",
                    value: staff.createdAt
                      ? new Date(staff.createdAt).toLocaleDateString("en-GB")
                      : "—",
                  },
                  {
                    Icon: IconClock,
                    label: "last Login",
                    value:
                      staff.lastLogin ??
                      (staff.updatedAt
                        ? new Date(staff.updatedAt).toLocaleString("en-GB")
                        : "—"),
                  },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[180px_1fr] items-center"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="size-4 shrink-0 text-gray-400" />
                      {label}
                    </div>
                    <span className="text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Change Status — full-width styled like the design */}
              {statusActions.length > 0 && (
                <div className="mt-6 relative">
                  <button
                    onClick={() => setStatusOpen((o) => !o)}
                    disabled={staffActionLoading}
                    className="flex w-full items-center justify-between h-11 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-foreground bg-white hover:border-gray-300 transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      {staffActionLoading && <Spinner />}
                      Change Status
                    </span>
                    <IconChevronDown className="size-4 text-gray-400" />
                  </button>
                  {statusOpen && (
                    <div className="absolute top-full mt-1 left-0 w-full rounded-xl border border-gray-100 bg-white shadow-lg z-10">
                      {statusActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleStatusAction(action)}
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Activity Log ── */}
        <div className="mb-5">
          <DataTable
            columns={activityColumns}
            data={activityLog}
            title="Activity Log"
            showFilters={false}
            showSort={false}
            showSelection={false}
            showPagination={activityLog.length > 0}
            pageSize={10}
            emptyState={<ActivityLogEmpty />}
          />
        </div>

        {/* ── User role and permissions ── */}
        <div className="rounded-xl bg-white border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            User role and permissions
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Assign user role and permissions
          </p>

          {/* Role selector — pre-selected from API data */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Assign role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11 w-full rounded-lg border-gray-200 text-sm">
                <SelectValue placeholder="Select a role from the drop down" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Product Moderator">
                  Product Moderator
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PermissionsPanel perms={perms} onChange={handlePerm} />
        </div>

        {/* ── Save ── */}
        <div className="flex justify-end pb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "h-11 px-10 rounded-md font-semibold",
              !saving
                ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                : "bg-[#F97316]/60 text-white cursor-not-allowed",
            )}
          >
            {saving ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="flex flex-col items-center justify-center gap-4 p-6 h-62 w-62 border rounded-full bg-[#EFEFEF]">
        <img
          src="/emptystate.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        No staff here yet!
      </h3>
      <p className="text-sm text-muted-foreground">
        Add a new staff by clicking on the button below
      </p>
      <Button
        onClick={onAdd}
        className="mt-3 h-11 px-10 rounded-md bg-[#1a1a1a] text-sm font-semibold text-white hover:bg-[#333]"
      >
        Add Staff
      </Button>
    </div>
  );
}

// ─── Edit Staff form ──────────────────────────────────────────────────────────

function EditStaffForm({
  staff,
  onClose,
  onSaved,
}: {
  staff: Staff;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { editStaff, staffActionLoading } = useReduxAdmin();

  const [step, setStep] = useState<1 | 2>(1);
  const [fn, setFn] = useState(staff.firstName);
  const [ln, setLn] = useState(staff.lastName);
  const [email, setEmail] = useState(staff.email);
  const [emailErr, setEmailErr] = useState("");
  const [role, setRole] = useState(staff.role ?? "");
  const [perms, setPerms] = useState<Record<string, boolean>>({});

  const s1ok = fn.trim() && ln.trim() && email.trim() && !emailErr;

  const validateEmail = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address");
    } else {
      setEmailErr("");
    }
  };

  const handlePerm = (key: string, val: boolean) => {
    setPerms((p) => ({ ...p, [key]: val }));
  };

  const handleSave = async () => {
    try {
      await editStaff(staff.id, {
        firstName: fn,
        lastName: ln,
        email,
        role,
        permissions: perms,
      });
      onSaved();
    } catch {
      // toast shown inside editStaff
    }
  };

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-foreground hover:text-[#F97316] transition-colors"
          >
            <IconArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Staff Management
          </h1>
        </div>

        <div className="w-full rounded-xl border bg-white p-6">
          <StepBar step={step} />

          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Edit Staff
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Update staff member details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    First Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={fn}
                    onChange={(e) => setFn(e.target.value)}
                    placeholder="Enter first name"
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name <span className="text-[#F97316]">*</span>
                  </label>
                  <Input
                    value={ln}
                    onChange={(e) => setLn(e.target.value)}
                    placeholder="Enter last name"
                    className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#F97316]"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email{" "}
                    {emailErr ? (
                      <span className="ml-1 font-normal text-red-500 text-xs">
                        * {emailErr}
                      </span>
                    ) : (
                      <span className="text-[#F97316]">*</span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailErr) setEmailErr("");
                    }}
                    onBlur={validateEmail}
                    placeholder="Enter email"
                    className={cn(
                      "h-11 rounded-lg focus-visible:ring-[#F97316]",
                      emailErr ? "border-red-500" : "border-gray-300",
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Assign Roles &amp; Permissions
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Update staff member role and permissions
              </p>
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Assign role
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-gray-300 text-sm">
                    <SelectValue placeholder="Select a role from the drop down" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Product Moderator">
                      Product Moderator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Custom Permissions
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Assign users permissions
                </p>
                <PermissionsPanel perms={perms} onChange={handlePerm} />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!s1ok}
              className={cn(
                "h-11 px-10 gap-2 rounded-md font-semibold",
                s1ok
                  ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                  : "bg-[#F97316]/40 text-white cursor-not-allowed pointer-events-none",
              )}
            >
              Next <IconArrowRight className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconArrowLeft className="size-4" /> Back
              </button>
              <Button
                onClick={handleSave}
                disabled={staffActionLoading}
                className={cn(
                  "h-11 px-10 gap-2 rounded-md font-semibold",
                  !staffActionLoading
                    ? "bg-[#F97316] text-white hover:bg-[#F97316]/90"
                    : "bg-[#F97316]/40 text-white cursor-not-allowed",
                )}
              >
                {staffActionLoading ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Staff list page ──────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function StaffListPage({
  onAdd,
  onView,
  onEdit,
  showEditSuccessBanner,
  onDismissEditBanner,
}: {
  onAdd: () => void;
  onView: (s: Staff) => void;
  onEdit: (s: Staff) => void;
  showEditSuccessBanner?: boolean;
  onDismissEditBanner?: () => void;
}) {
  const { staff, staffLoading, staffTotal, loadStaff } = useReduxAdmin();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // Initial load + whenever page changes
  useEffect(() => {
    loadStaff({
      page: currentPage,
      limit: PAGE_SIZE,
      search: search || undefined,
    });
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadStaff({ page: 1, limit: PAGE_SIZE, search: search || undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalStaff = staffTotal;
  const activeStaff = staff.filter((s) => s.status === "ACTIVE").length;
  const suspendedStaff = staff.filter((s) => s.status === "SUSPENDED").length;
  const deactivatedStaff = staff.filter(
    (s) => s.status === "DEACTIVATED",
  ).length;

  const stats = [
    {
      title: "Total Staff",
      value: staffLoading ? "—" : totalStaff,
      icon: <IconUsers className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#F97316] to-[#ea6a0a]",
    },
    {
      title: "Active Staff",
      value: staffLoading ? "—" : activeStaff,
      icon: <IconUserCheck className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#f08020] to-[#d97015]",
    },
    {
      title: "Suspended Staff",
      value: staffLoading ? "—" : suspendedStaff,
      icon: <IconUserOff className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#c05f10] to-[#a84f0a]",
    },
    {
      title: "Deactivated Staff",
      value: staffLoading ? "—" : deactivatedStaff,
      icon: <IconUserX className="size-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#6b3a10] to-[#4a2808]",
    },
  ];

  const columns: ColumnDef<Staff>[] = [
    {
      id: "staffName",
      accessorFn: (s) => getFullName(s),
      header: "Staff name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {getFullName(row.original)}
        </span>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Assigned role",
      cell: ({ row }) => (
        <span className="text-foreground">{row.original.role || "—"}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={toDisplayStatus(row.original.status)} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-6">
          <button
            onClick={() => onView(row.original)}
            className="text-gray-400 hover:text-[#F97316] transition-colors"
          >
            <Eye className="size-5" />
          </button>
          <button
            onClick={() => onEdit(row.original)}
            className="text-gray-400 hover:text-[#F97316] transition-colors"
          >
            <IconEdit className="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageShell>
      <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
        <h1 className="mb-5 text-2xl font-bold text-foreground">
          Staff Management
        </h1>

        {showEditSuccessBanner && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
            <svg
              className="size-5 shrink-0 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-5" />
            </svg>
            <p className="flex-1 text-sm font-semibold text-green-800">
              Staff member details have been updated successfully
            </p>
            <button
              onClick={onDismissEditBanner}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        <div className="rounded-xl bg-white">
          <DataTable
            columns={columns}
            data={staff}
            title="All Staff"
            description="Manage and monitor all staff on the platform"
            headerAction={
              <Button
                onClick={onAdd}
                className="h-9 gap-1.5 rounded-md bg-[#F97316] px-4 text-sm font-semibold text-white hover:bg-[#F97316]/90"
              >
                <IconPlus className="size-3.5" /> Add Staff
              </Button>
            }
            searchColumn="staffName"
            searchPlaceholder="Search"
            showFilters
            showSort
            sortLabel="Upload Date"
            showSelection
            showPagination
            pageSize={PAGE_SIZE}
            total={staffTotal}
            page={currentPage}
            onPageChange={setCurrentPage}
            loading={staffLoading}
            emptyState={<EmptyState onAdd={onAdd} />}
          />
        </div>
      </div>
    </PageShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type View = "list" | "add" | "view" | "edit" | "edit-success";

export default function StaffPage() {
  const [view, setView] = useState<View>("list");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);

  const handleAdd = useCallback(() => setView("add"), []);

  // Navigate to view — load full detail inside SingleStaffView via staffId
  const handleView = useCallback((s: Staff) => {
    setSelectedStaff(s);
    setView("view");
  }, []);

  const handleEdit = useCallback((s: Staff) => {
    setSelectedStaff(s);
    setView("edit");
  }, []);

  // ── Add staff ──
  if (view === "add")
    return (
      <>
        <AddStaffForm
          onClose={() => setView("list")}
          onSuccess={() => {
            setShowCreateSuccess(true);
            setView("list");
          }}
        />
        {showCreateSuccess && (
          <SuccessModal onDone={() => setShowCreateSuccess(false)} />
        )}
      </>
    );

  // ── View staff ──
  if (view === "view" && selectedStaff)
    return (
      <SingleStaffView
        staffId={selectedStaff.id}
        onClose={() => {
          setSelectedStaff(null);
          setView("list");
        }}
      />
    );

  // ── Edit staff ──
  if (view === "edit" && selectedStaff)
    return (
      <EditStaffForm
        staff={selectedStaff}
        onClose={() => setView("list")}
        onSaved={() => {
          setSelectedStaff(null);
          setView("edit-success");
        }}
      />
    );

  // ── List ──
  return (
    <>
      <StaffListPage
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        showEditSuccessBanner={view === "edit-success"}
        onDismissEditBanner={() => setView("list")}
      />
      {showCreateSuccess && (
        <SuccessModal onDone={() => setShowCreateSuccess(false)} />
      )}
    </>
  );
}
