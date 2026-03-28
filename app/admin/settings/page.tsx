"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import {
  IconX, IconCheck, IconCamera, IconUpload, IconTrash,
  IconChevronDown, IconEye, IconEyeOff,
} from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useReduxAuth } from "@/hooks/useReduxAuth"
import api from "@/utils/api"
import { toast } from "sonner"

type Tab = "general" | "security"

const COUNTRY_CODES = [
  { code: "256", label: "🇺🇬 UG" },
  { code: "254", label: "🇰🇪 KE" },
  { code: "255", label: "🇹🇿 TZ" },
  { code: "250", label: "🇷🇼 RW" },
  { code: "1",   label: "🇺🇸 US" },
  { code: "44",  label: "🇬🇧 GB" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Split a "+256 778989582" or "778989582" phone into { cc, number } */
function parsePhone(raw: string | undefined): { cc: string; number: string } {
  if (!raw) return { cc: "256", number: "" }
  const stripped = raw.replace(/\s+/g, "")
  for (const c of COUNTRY_CODES) {
    if (stripped.startsWith(`+${c.code}`)) {
      return { cc: c.code, number: stripped.slice(c.code.length + 1) }
    }
    if (stripped.startsWith(c.code)) {
      return { cc: c.code, number: stripped.slice(c.code.length) }
    }
  }
  return { cc: "256", number: stripped }
}

// ─── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
      <IconCheck className="size-5 shrink-0 text-green-600" strokeWidth={2.5} />
      <p className="flex-1 text-sm font-semibold text-green-800">{message}</p>
      <button onClick={onDismiss} className="text-green-400 hover:text-green-600 transition-colors">
        <IconX className="size-4" />
      </button>
    </div>
  )
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordInput({
  label, value, onChange, placeholder = "Enter your password",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} <span className="text-[#F97316]">*</span>
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 rounded-lg border-gray-200 pr-11 focus-visible:ring-[#F97316] text-sm"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-200 mb-6">
      {(["general", "security"] as Tab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "py-3 text-sm font-semibold capitalize transition-colors relative",
            active === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {active === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F97316] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  )
}

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab() {
  const { user, updateCurrentUser } = useReduxAuth()

  // Seed state from Redux user
  const [name, setName]       = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  )
  const [cc, setCc]           = useState(parsePhone(user?.phoneNumber).cc)
  const [phone, setPhone]     = useState(parsePhone(user?.phoneNumber).number)
  const [ccOpen, setCcOpen]   = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSaving, setIsSaving]   = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Original values for dirty check
  const originalName  = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  const originalPhone = parsePhone(user?.phoneNumber)

  const isDirty =
    name !== originalName ||
    phone !== originalPhone.number ||
    cc !== originalPhone.cc ||
    avatarFile !== null

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const handleDeleteAvatar = () => {
    setAvatarFile(null)
    setAvatarUrl(null)
  }

  const handleSave = async () => {
    if (!isDirty) return
    setIsSaving(true)
    try {
      const [firstName, ...rest] = name.trim().split(" ")
      const lastName = rest.join(" ")

      const formData = new FormData()
      formData.append("firstName", firstName)
      if (lastName) formData.append("lastName", lastName)
      formData.append("phoneNumber", `+${cc}${phone}`)
      if (avatarFile) formData.append("avatar", avatarFile)

      const { data } = await api.patch("/api/v1/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Sync Redux store with new values
      updateCurrentUser({
        firstName: data.firstName ?? firstName,
        lastName: data.lastName ?? lastName,
        phoneNumber: data.phoneNumber ?? `+${cc}${phone}`,
        avatarUrl: data.avatarUrl ?? avatarUrl ?? undefined,
      })

      setAvatarFile(null)
      setShowBanner(true)
      toast.success("Profile updated successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your changes have been saved"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <h3 className="mb-5 text-lg font-semibold text-foreground">Profile</h3>

      {/* Avatar */}
      <div className="mb-8 flex items-start gap-5">
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
            className="absolute bottom-0 right-0 flex items-center justify-center size-8 rounded-full bg-[#F97316] text-white shadow-md hover:bg-[#F97316]/90 transition-colors"
          >
            <IconCamera className="size-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={handleUpload} />
        </div>

        <div className="pt-1">
          <p className="text-base font-semibold text-foreground">Change Avatar</p>
          <p className="mt-0.5 text-xs text-muted-foreground/40">JPG, PNG, WEBP · Max 3MB</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#333] transition-colors"
            >
              <IconUpload className="size-3.5 text-[#F97316]" />
              Upload New Avatar
            </button>
            <button
              onClick={handleDeleteAvatar}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-foreground hover:border-gray-400 transition-colors"
            >
              <IconTrash className="size-3.5 text-[#F97316]" />
              Delete Avatar
            </button>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <h3 className="mb-4 text-lg font-semibold text-foreground">Personal Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-12 rounded-lg border-gray-200 focus-visible:ring-[#F97316] text-sm"
          />
        </div>

        <div className="sm:col-span-1 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCcOpen(v => !v)}
                  className="flex h-12 items-center gap-1.5 rounded-lg border border-gray-200 bg-background px-3 text-sm font-medium hover:border-[#F97316] transition-colors whitespace-nowrap"
                >
                  {cc} <IconChevronDown className="size-3 text-muted-foreground" />
                </button>
                {ccOpen && (
                  <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded-lg border bg-card shadow-lg py-1">
                    {COUNTRY_CODES.map(c => (
                      <button key={c.code} type="button"
                        onClick={() => { setCc(c.code); setCcOpen(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-12 w-44 rounded-lg border-gray-200 focus-visible:ring-[#F97316] text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "h-11 min-w-[140px] rounded-lg text-sm font-semibold transition-all",
            isDirty && !isSaving
              ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
              : "bg-gray-300 text-white cursor-not-allowed pointer-events-none"
          )}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { user } = useReduxAuth()
  const [current,  setCurrent]  = useState("")
  const [newPass,  setNewPass]  = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [showBanner, setShowBanner]   = useState(false)
  const [confirmError, setConfirmError] = useState("")

  const allFilled = current.trim() && newPass.trim() && confirm.trim()
  const canSubmit = !!(allFilled && !confirmError)

  const handleConfirmBlur = () => {
    if (confirm && newPass && confirm !== newPass) {
      setConfirmError("Passwords do not match")
    } else {
      setConfirmError("")
    }
  }

  const handleReset = async () => {
    if (!canSubmit) return
    setIsResetting(true)
    try {
      await api.post("/api/v1/profile/change-password", {
        currentPassword: current,
        newPassword: newPass,
      })
      setCurrent(""); setNewPass(""); setConfirm("")
      setShowBanner(true)
      toast.success("Password changed successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your password has been successfully changed"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <h3 className="mb-5 text-lg font-semibold text-foreground">Change Password</h3>

      {/* Show email as context — helpful UX */}
      {user?.email && (
        <p className="mb-4 text-sm text-muted-foreground">
          Changing password for <span className="font-medium text-foreground">{user.email}</span>
        </p>
      )}

      <div className="flex flex-col gap-4 max-w-[560px]">
        <PasswordInput
          label="Current Password"
          value={current}
          onChange={setCurrent}
          placeholder="Enter your current password"
        />
        <PasswordInput
          label="New Password"
          value={newPass}
          onChange={v => { setNewPass(v); if (confirmError) setConfirmError("") }}
          placeholder="Enter your new password"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm Password <span className="text-[#F97316]">*</span>
            {confirmError && (
              <span className="ml-2 font-normal text-red-500 text-xs">{confirmError}</span>
            )}
          </label>
          <div className="relative">
            <Input
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); if (confirmError) setConfirmError("") }}
              onBlur={handleConfirmBlur}
              placeholder="Confirm new password"
              className={cn(
                "h-12 rounded-lg pr-11 focus-visible:ring-[#F97316] text-sm",
                confirmError ? "border-red-400 focus-visible:ring-red-300" : "border-gray-200"
              )}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleReset}
          disabled={!canSubmit || isResetting}
          className={cn(
            "h-11 min-w-[160px] rounded-lg text-sm font-semibold transition-all",
            canSubmit && !isResetting
              ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
              : "bg-gray-300 text-white cursor-not-allowed pointer-events-none"
          )}
        >
          {isResetting ? (
            <span className="flex items-center gap-2">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Resetting…
            </span>
          ) : "Reset Password"}
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general")

  const headings: Record<Tab, { page: string; section: string; sub: string }> = {
    general:  { page: "Settings",          section: "Profile Settings",  sub: "Make changes to your profile information" },
    security: { page: "General Settings",  section: "Security Settings", sub: "Make changes to your password information" },
  }

  const h = headings[tab]

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
        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-[#F7F7F7]">
          <h1 className="mb-5 text-2xl font-bold text-foreground">{h.page}</h1>
          <div className="w-full max-w-8xl rounded-lg border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">{h.section}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{h.sub}</p>
            </div>
            <TabBar active={tab} onChange={setTab} />
            {tab === "general"  && <GeneralTab />}
            {tab === "security" && <SecurityTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}