"use client";

import * as React from "react";
import { useState, useRef } from "react";
import {
  IconX,
  IconCheck,
  IconCamera,
  IconUpload,
  IconTrash,
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

type Tab = "general" | "security" | "payout";

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

// ─── Success Banner ───────────────────────────────────────────────────────────

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-md border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
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

// ─── Password Input ───────────────────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
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
            error
              ? "border-red-400 focus-visible:ring-red-300"
              : "border-gray-200 focus-visible:ring-[#F97316]/40"
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

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const TAB_LABELS: Record<Tab, string> = {
  general: "General",
  security: "Security",
  payout: "Payout Information",
};

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="grid grid-cols-3 border-b border-gray-200 mb-8">
      {(["general", "security", "payout"] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "py-3.5 text-sm font-semibold transition-colors relative",
            active === tab
              ? "text-foreground bg-gray-50"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {TAB_LABELS[tab]}
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-full border border-gray-300 size-7 text-gray-500 hover:border-gray-500 transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* Trash illustration */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center justify-center">
           <img src="/trash.png" alt="" className="h-38 w-38"/>
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
            className="flex-1 h-11 rounded-md border-gray-300 text-foreground font-semibold hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-md bg-[#1a1a1a] text-white font-semibold hover:bg-[#333]"
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

  const [businessName, setBusinessName] = useState(
    (user as any)?.businessName ?? (user as any)?.profile?.businessName ?? ""
  );

  const [contactName, setContactName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  );
  const parsed = parsePhone(user?.phoneNumber);
  const [cc, setCc] = useState(parsed.cc);
  const [phone, setPhone] = useState(parsed.number);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const origBusinessName = (user as any)?.businessName ?? (user as any)?.profile?.businessName ?? "";
  const origContactName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  const isDirty =
    businessName !== origBusinessName ||
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
      <h3 className="text-2xl font-bold text-foreground mb-6">{displayName}</h3>

      {/* Avatar section */}
      <div className="mb-8 flex items-center gap-5">
        {/* Rounded-square avatar thumbnail */}
        <div className="relative shrink-0">
          <div className="size-[100px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
            ) : (
              <svg viewBox="0 0 100 100" className="size-full" fill="none">
                <rect width="100" height="100" fill="#e5e7eb" />
                <circle cx="50" cy="38" r="20" fill="#9ca3af" />
                <ellipse cx="50" cy="92" rx="36" ry="26" fill="#9ca3af" />
              </svg>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-[#F97316] text-white shadow-md hover:bg-[#F97316]/90 transition-colors"
          >
            <IconCamera className="size-4" />
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
          <p className="text-lg font-bold text-foreground mb-0.5">Upload Business Avatar</p>
          <p className="text-xs text-muted-foreground mb-4">JPG, PNG, WEBP Max Size 3MB</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
            >
              <IconUpload className="size-3.5 text-[#F97316]" />
              Upload Avatar
            </button>
            <button
              onClick={handleDeleteAvatar}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-muted-foreground hover:border-gray-300 transition-colors"
            >
              <IconTrash className="size-3.5" />
              Delete Avatar
            </button>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <h4 className="text-xl font-bold text-foreground mb-4">Business Details</h4>
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Business Name <span className="text-[#F97316]">*</span>
        </label>
        <Input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
        />
      </div>

      {/* Personal Details */}
      <h4 className="text-xl font-bold text-foreground mb-4">Personal Details</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Contact person name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-[#F97316]">*</span>
          </label>
          <PhoneField phone={phone} setPhone={setPhone} cc={cc} setCc={setCc} />
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className={cn(
          "h-11 min-w-[160px] rounded-md text-sm font-semibold transition-all",
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

      {/* Change Password */}
      <h3 className="text-2xl font-bold text-foreground mb-6">Change Password</h3>

      <div className="flex flex-col gap-4 mb-6">
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
        <div onBlur={handleConfirmBlur}>
          <PasswordInput
            label="Confirm Password"
            value={confirm}
            onChange={(v) => { setConfirm(v); if (confirmError) setConfirmError(""); }}
            placeholder="Confirm password"
            error={confirmError || undefined}
          />
        </div>
      </div>

      {/* Reset button */}
      <div className="mb-8">
        <Button
          onClick={handleReset}
          disabled={!canSubmit || isResetting}
          className={cn(
            "h-11 min-w-[160px] rounded-md text-sm font-semibold transition-all",
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
      <div className="border-t border-gray-200 mb-8" />

      {/* Close Account */}
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
          className="shrink-0 flex items-center gap-2 rounded-md bg-[#c0392b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a93226] transition-colors"
        >
          Close account
        </button>
      </div>

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

// ─── Payout Information Tab ───────────────────────────────────────────────────

type PayoutMethod = "bank" | "mobile";

function PayoutTab() {
  const [method, setMethod] = useState<PayoutMethod>("bank");

  // Bank fields
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  // Mobile Money fields
  const [mobileNumber, setMobileNumber] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (method === "bank") {
        await api.post("/api/v1/profile/payout/bank", {
          bankName, accountNumber, swiftCode,
        });
      } else {
        await api.post("/api/v1/profile/payout/mobile", {
          mobileNumber, serviceProvider, registeredName,
        });
      }
      toast.success("Payout information saved successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save payout information");
    } finally {
      setIsSaving(false);
    }
  };

  // Todo: Add form validation and pre-fill existing payout information if available especially for mobile money which is more common in our markets

  return (
    <div>
      {/* Heading */}
      <h3 className="text-2xl font-bold text-foreground mb-1">Payment Information</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Choose either Bank or mobile Money or to receive your payments
      </p>

      {/* Sub-tab toggle */}
      <div className="flex items-center gap-3 mb-6">
        {/* Bank tab */}
        <button
          onClick={() => setMethod("bank")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
            method === "bank"
              ? "border-[#F97316] bg-orange-50 text-foreground"
              : "border-gray-200 bg-white text-muted-foreground hover:border-gray-300"
          )}
        >
          <svg
            className={cn("size-4 shrink-0", method === "bank" ? "text-[#F97316]" : "text-gray-400")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Enter Bank Information
        </button>

        {/* Mobile Money tab */}
        <button
          onClick={() => setMethod("mobile")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
            method === "mobile"
              ? "border-[#F97316] bg-orange-50 text-foreground"
              : "border-gray-200 bg-white text-muted-foreground hover:border-gray-300"
          )}
        >
          <svg
            className={cn("size-4 shrink-0", method === "mobile" ? "text-[#F97316]" : "text-gray-400")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Enter Mobile Money Information
        </button>
      </div>

      {/* Bank form */}
      {method === "bank" && (
        <div className="flex flex-col gap-4 max-w-[640px]">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bank Name <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter your new password"
              className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Account Number <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Confirm password"
              className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Account Number <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value)}
              placeholder="Confirm password"
              className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Swift Code <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
              placeholder="Confirm password"
              className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
            />
          </div>
        </div>
      )}

      {/* Mobile Money form */}
      {method === "mobile" && (
        <div className="flex flex-col gap-4 max-w-[640px]">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mobile Money Number <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              className="h-12 rounded-md border-gray-200 focus-visible:ring-[#F97316]/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Service Provider <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={serviceProvider}
              readOnly
              placeholder="Automatically loads"
              className="h-12 rounded-md border-gray-200 bg-gray-50 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Registered names <span className="text-[#F97316]">*</span>
            </label>
            <Input
              value={registeredName}
              readOnly
              placeholder="Automatically loads user names"
              className="h-12 rounded-md border-gray-200 bg-gray-50 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 min-w-[120px] rounded-md bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-60"
        >
          {isSaving ? (
            <span className="flex items-center gap-2"><Spinner /> Saving…</span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Section header text per tab ─────────────────────────────────────────────

const SECTION_HEADERS: Record<Tab, { title: string; subtitle: string }> = {
  general: {
    title: "Complete Your Business Profile",
    subtitle: "Make chnages to your business profile information",
  },
  security: {
    title: "Security Settings",
    subtitle: "Make chnages to your password information",
  },
  payout: {
    title: "Payout Information",
    subtitle: "Choose either Bank or mobile Money to receive your payments",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  const { title, subtitle } = SECTION_HEADERS[tab];

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

          <div className="w-full max-w-8xl rounded-md border bg-card p-6">
            {/* Section header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-0.5 text-sm text-[#F97316]">{subtitle}</p>
            </div>

            <TabBar active={tab} onChange={setTab} />

            {tab === "general"  && <GeneralTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "payout"   && <PayoutTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}