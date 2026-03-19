"use client";

import * as React from "react";
import { useState, useRef } from "react";
import {
  IconX,
  IconCheck,
  IconCamera,
  IconUpload,
  IconTrash,
  IconChevronDown,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import api from "@/utils/api";
import { toast } from "sonner";
import PhoneField from "@/components/PhoneField";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "general" | "security";

const COUNTRY_CODES = [
  { code: "256", label: "+256" },
  { code: "254", label: "+254" },
  { code: "255", label: "+255" },
  { code: "250", label: "+250" },
  { code: "1",   label: "+1" },
  { code: "44",  label: "+44" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePhone(raw: string | undefined): { cc: string; number: string } {
  if (!raw) return { cc: "256", number: "" };
  const stripped = raw.replace(/\s+/g, "");
  for (const c of COUNTRY_CODES) {
    if (stripped.startsWith(`+${c.code}`)) {
      return { cc: c.code, number: stripped.slice(c.code.length + 1) };
    }
    if (stripped.startsWith(c.code)) {
      return { cc: c.code, number: stripped.slice(c.code.length) };
    }
  }
  return { cc: "256", number: stripped };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-green-500">
        <IconCheck className="size-3 text-green-600" strokeWidth={3} />
      </div>
      <p className="flex-1 text-sm font-semibold text-green-800">{message}</p>
      <button onClick={onDismiss} className="text-green-400 hover:text-green-600 transition-colors">
        <IconX className="size-4" />
      </button>
    </div>
  );
}

// ─── Password input ───────────────────────────────────────────────────────────

function PasswordInput({
  label, value, onChange, placeholder = "Enter your password", error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-[#F97316]">*</span>
        {error && <span className="ml-1 text-xs text-red-500">{error}</span>}
      </div>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-12 rounded-md pr-11 text-sm",
            error ? "border-red-400 focus-visible:ring-red-300" : "border-gray-200 focus-visible:ring-[#F97316]"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-200 mb-8">
      {(["general", "security"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "py-3 text-sm font-semibold capitalize transition-colors relative",
            active === tab
              ? "text-foreground bg-gray-50"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {active === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F97316] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Close Account Modal ──────────────────────────────────────────────────────

function CloseAccountModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-[#faf5f0] p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Trash illustration */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center justify-center size-24">
            <svg viewBox="0 0 96 96" className="w-full h-full" fill="none">
              {/* Trash bin body */}
              <rect x="22" y="38" width="52" height="48" rx="4" fill="#1a1a1a" />
              {/* Lid */}
              <rect x="16" y="28" width="64" height="12" rx="3" fill="#1a1a1a" />
              <rect x="34" y="20" width="28" height="10" rx="3" fill="#1a1a1a" />
              {/* Recycle symbol on bin */}
              <path d="M48 48 L44 55 L52 55 Z" fill="white" />
              <path d="M48 48 L54 55" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="48" cy="60" r="2" fill="white" />
              {/* Papers flying out */}
              <rect x="36" y="12" width="10" height="8" rx="1" fill="#d1d5db" transform="rotate(-15 36 12)" />
              <rect x="52" y="8" width="8" height="6" rx="1" fill="#d1d5db" transform="rotate(10 52 8)" />
              <rect x="62" y="16" width="9" height="7" rx="1" fill="#d1d5db" transform="rotate(20 62 16)" />
              {/* Lines on papers */}
              <line x1="38" y1="14" x2="44" y2="14" stroke="#9ca3af" strokeWidth="1" transform="rotate(-15 41 14)" />
              <line x1="38" y1="17" x2="43" y2="17" stroke="#9ca3af" strokeWidth="1" transform="rotate(-15 41 17)" />
              {/* Motion lines */}
              <line x1="72" y1="30" x2="80" y2="26" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="38" x2="83" y2="38" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="30" x2="12" y2="26" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          Close this Account?
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-8 max-w-xs mx-auto">
          Are you sure you'd like to close this account? After 30 days, all your
          data will be permanently deleted
        </p>

        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-11 rounded-xl border-gray-300 text-foreground font-semibold hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#333]"
          >
            {loading ? <><Spinner /> Closing…</> : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab() {
  const { user, updateCurrentUser } = useReduxAuth();

  // Business fields
  const [businessName, setBusinessName] = useState(
    (user as any)?.businessName ?? (user as any)?.profile?.businessName ?? ""
  );
  const [businessDesc, setBusinessDesc] = useState(
    (user as any)?.businessDescription ?? (user as any)?.profile?.description ?? ""
  );

  // Personal / contact fields
  const [contactName, setContactName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  );
  const parsed = parsePhone(user?.phoneNumber);
  const [cc, setCc] = useState(parsed.cc);
  const [phone, setPhone] = useState(parsed.number);
  const [ccOpen, setCcOpen] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // State
  const [isSaving, setIsSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const origBusinessName = (user as any)?.businessName ?? (user as any)?.profile?.businessName ?? "";
  const origBusinessDesc = (user as any)?.businessDescription ?? (user as any)?.profile?.description ?? "";
  const origContactName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  const isDirty =
    businessName !== origBusinessName ||
    businessDesc !== origBusinessDesc ||
    contactName !== origContactName ||
    phone !== parsed.number ||
    cc !== parsed.cc ||
    avatarFile !== null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const [firstName, ...rest] = contactName.trim().split(" ");
      const lastName = rest.join(" ");

      const formData = new FormData();
      formData.append("businessName", businessName);
      if (businessDesc) formData.append("businessDescription", businessDesc);
      formData.append("firstName", firstName);
      if (lastName) formData.append("lastName", lastName);
      formData.append("phoneNumber", `+${cc}${phone}`);
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await api.patch("/api/v1/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateCurrentUser({
        firstName: data.firstName ?? firstName,
        lastName: data.lastName ?? lastName,
        phoneNumber: data.phoneNumber ?? `+${cc}${phone}`,
        avatarUrl: data.avatarUrl ?? avatarUrl ?? undefined,
      });

      setAvatarFile(null);
      setShowBanner(true);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = businessName || contactName || "Your Business";

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your changes have been successfully saved"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Business name heading */}
      <h3 className="text-xl font-bold text-foreground mb-5">{displayName}</h3>

      {/* Avatar section */}
      <div className="mb-8 flex items-center gap-5">
        {/* Avatar thumbnail */}
        <div className="relative shrink-0">
           <div className="size-[90px] rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
            ) : (
              <svg viewBox="0 0 90 90" className="size-full" fill="none">
                <rect width="90" height="90" fill="#e5e7eb" />
                <circle cx="45" cy="35" r="18" fill="#9ca3af" />
                <ellipse cx="45" cy="80" rx="28" ry="20" fill="#9ca3af" />
              </svg>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-[#F97316] text-white shadow-md hover:bg-[#F97316]/90 transition-colors"
          >
            <IconCamera className="size-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Upload controls */}
        <div>
          <p className="text-base font-bold text-foreground mb-0.5">Upload Business Avatar</p>
          <p className="text-xs text-muted-foreground mb-3">JPG, PNG, WEBP Max Size 3MB</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#333] transition-colors"
            >
              <IconUpload className="size-3.5 text-[#F97316]" />
              Upload Avatar
            </button>
            <button
              onClick={handleDeleteAvatar}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:border-gray-300 transition-colors"
            >
              <IconTrash className="size-3.5" />
              Delete Avatar
            </button>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <h4 className="text-base font-bold text-foreground mb-4">Business Details</h4>
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Business Name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-0.5">
            Business Description
          </label>
          <p className="text-xs text-[#F97316] mb-2">
            Describe this business, including its mission, values, and products or services offered.
          </p>
          <textarea
            value={businessDesc}
            onChange={(e) => setBusinessDesc(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 transition-all"
          />
        </div>
      </div>

      {/* Personal Details */}
      <h4 className="text-base font-bold text-foreground mb-4">Personal Details</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Contact person name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-[#F97316]">*</span>
          </label>
          <PhoneField
            phone={phone}
            setPhone={setPhone}
            cc={cc}
            setCc={setCc}
          />
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className={cn(
          "h-11 min-w-[140px] rounded-md text-sm font-semibold transition-all",
          isDirty && !isSaving
            ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
            : "bg-gray-300 text-white cursor-not-allowed pointer-events-none"
        )}
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <Spinner /> Saving…
          </span>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { user } = useReduxAuth();

  // Change password
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Close account
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const allFilled = current.trim() && newPass.trim() && confirm.trim();
  const canSubmit = !!(allFilled && !confirmError);

  const handleConfirmBlur = () => {
    if (confirm && newPass && confirm !== newPass) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleReset = async () => {
    if (!canSubmit) return;
    setIsResetting(true);
    try {
      await api.post("/api/v1/profile/change-password", {
        currentPassword: current,
        newPassword: newPass,
      });
      setCurrent(""); setNewPass(""); setConfirm("");
      setShowBanner(true);
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCloseAccount = async () => {
    setIsClosing(true);
    try {
      await api.delete("/api/v1/profile/close-account");
      toast.success("Account closed. You will be logged out shortly.");
      setShowCloseModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to close account");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your password has been successfuly changed"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Change Password section */}
      <h3 className="text-xl font-bold text-foreground mb-6">Change Password</h3>

      <div className="flex flex-col gap-4 max-w-[600px]">
        <PasswordInput
          label="Current Password"
          value={current}
          onChange={setCurrent}
          placeholder="Enter your new password"
        />
        <PasswordInput
          label="Create new password"
          value={newPass}
          onChange={(v) => { setNewPass(v); if (confirmError) setConfirmError(""); }}
          placeholder="Enter your new password"
        />
        <PasswordInput
          label="Confirm Password"
          value={confirm}
          onChange={(v) => { setConfirm(v); if (confirmError) setConfirmError(""); }}
          placeholder="Confirm password"
          error={confirmError || undefined}
        />
      </div>

      {/* Reset button */}
      <div className="mt-6 mb-8">
        <Button
          onClick={handleReset}
          disabled={!canSubmit || isResetting}
          className={cn(
            "h-11 min-w-[160px] rounded-xl text-sm font-semibold transition-all",
            canSubmit && !isResetting
              ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
              : "bg-gray-300 text-white cursor-not-allowed pointer-events-none"
          )}
        >
          {isResetting ? (
            <span className="flex items-center gap-2">
              <Spinner /> Resetting…
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-8" />

      {/* Close Account section */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">Close your Account</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            This action is irreversible after 30 days. Once completed, your account
            will be deactivated and all your data will be permanently deleted
          </p>
        </div>
        <button
          onClick={() => setShowCloseModal(true)}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-[#c0392b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a93226] transition-colors"
        >
          Close account
        </button>
      </div>

      {/* Close Account modal */}
      {showCloseModal && (
        <CloseAccountModal
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleCloseAccount}
          loading={isClosing}
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

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
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7] min-h-screen">
          <h1 className="mb-5 text-2xl font-bold text-foreground">Settings</h1>

          <div className="w-full max-w-8xl rounded-xl border bg-card p-6">
            {/* Section header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {tab === "general" ? "Complete Your Business Profile" : "Security Settings"}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {tab === "general"
                  ? "Make chnages to your business profile information"
                  : "Make chnages to your password information"}
              </p>
            </div>

            <TabBar active={tab} onChange={setTab} />

            {tab === "general" && <GeneralTab />}
            {tab === "security" && <SecurityTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}