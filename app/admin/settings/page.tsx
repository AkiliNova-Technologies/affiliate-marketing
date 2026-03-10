// app/admin/settings/page.tsx
//
// Covers all 6 designs:
//   Image 6 — General tab, pristine (Save Changes disabled)
//   Image 5 — General tab, name changed (Save Changes active)
//   Image 4 — General tab, success banner after save
//   Image 3 — Security tab, pristine (Reset Password disabled)
//   Image 2 — Security tab, all fields filled (Reset Password active)
//   Image 1 — Security tab, success banner after reset

"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import {
  IconX,
  IconCheck,
  IconCamera,
  IconUpload,
  IconTrash,
  IconChevronDown,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "general" | "security"

// ─── Country codes ───────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "256", label: "🇺🇬 UG" },
  { code: "254", label: "🇰🇪 KE" },
  { code: "255", label: "🇹🇿 TZ" },
  { code: "250", label: "🇷🇼 RW" },
  { code: "1",   label: "🇺🇸 US" },
  { code: "44",  label: "🇬🇧 GB" },
]

// ─── Success / info banner ───────────────────────────────────────────────────

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 border-l-4 border-l-green-500 bg-green-50 px-5 py-3.5">
      <IconCheck className="size-5 shrink-0 text-green-600" strokeWidth={2.5} />
      <p className="flex-1 text-sm font-semibold text-green-800">{message}</p>
      <button onClick={onDismiss} className="text-green-400 hover:text-green-600 transition-colors">
        <IconX className="size-4" />
      </button>
    </div>
  )
}

// ─── Password input with show/hide ──────────────────────────────────────────

function PasswordInput({
  label, value, onChange, placeholder = "Enter your new password",
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
          className="h-12 rounded-xl border-gray-200 pr-11 focus-visible:ring-[#F97316] text-sm"
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

// ─── Tab bar ────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-200 mb-6">
      {(["general", "security"] as Tab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "py-3 text-sm font-semibold capitalize transition-colors relative",
            active === tab
              ? "text-foreground"
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
  )
}

// ─── General Tab ────────────────────────────────────────────────────────────

const INITIAL_NAME  = "John Smith"
const INITIAL_PHONE = "778989582"
const INITIAL_CC    = "256"

function GeneralTab() {
  const [name, setName]         = useState(INITIAL_NAME)
  const [phone, setPhone]       = useState(INITIAL_PHONE)
  const [cc, setCc]             = useState(INITIAL_CC)
  const [ccOpen, setCcOpen]     = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Dirty check — any change from initial values enables the button
  const isDirty = name !== INITIAL_NAME || phone !== INITIAL_PHONE || cc !== INITIAL_CC || avatarUrl !== null

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  const handleDeleteAvatar = () => setAvatarUrl(null)

  const handleSave = async () => {
    if (!isDirty) return
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setIsSaving(false)
    setShowBanner(true)
  }

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your changes have been saved"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Profile section */}
      <h3 className="mb-5 text-lg font-semibold text-foreground">Profile</h3>
      <div className="mb-8 flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="size-[90px] rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
            ) : (
              /* Default placeholder portrait */
              <svg viewBox="0 0 90 90" className="size-full" fill="none">
                <rect width="90" height="90" fill="#e5e7eb" />
                <circle cx="45" cy="35" r="18" fill="#9ca3af" />
                <ellipse cx="45" cy="80" rx="28" ry="20" fill="#9ca3af" />
              </svg>
            )}
          </div>
          {/* Camera badge */}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex items-center justify-center size-8 rounded-full bg-[#F97316] text-white shadow-md hover:bg-[#F97316]/90 transition-colors"
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

        {/* Avatar actions */}
        <div className="pt-1">
          <p className="text-base font-semibold text-foreground">Change Avatar</p>
          <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WEBP Max Size 3MB</p>
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
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Name <span className="text-[#F97316]">*</span>
          </label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus-visible:ring-[#F97316] text-sm"
          />
        </div>

        {/* Phone — country code + number side by side */}
        <div className="sm:col-span-1 flex items-end gap-2">
          {/* Spacer label on mobile */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
            <div className="flex gap-2">
              {/* Country code */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCcOpen(v => !v)}
                  className="flex h-12 items-center gap-1.5 rounded-xl border border-gray-200 bg-background px-3 text-sm font-medium hover:border-[#F97316] transition-colors whitespace-nowrap"
                >
                  {cc} <IconChevronDown className="size-3 text-muted-foreground" />
                </button>
                {ccOpen && (
                  <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded-xl border bg-card shadow-lg py-1">
                    {COUNTRY_CODES.map(c => (
                      <button
                        key={c.code}
                        type="button"
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
                className="h-12 w-44 rounded-xl border-gray-200 focus-visible:ring-[#F97316] text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "h-11 min-w-[140px] rounded-xl text-sm font-semibold transition-all",
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

// ─── Security Tab ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current,  setCurrent]  = useState("")
  const [newPass,  setNewPass]  = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [showBanner, setShowBanner]   = useState(false)
  const [confirmError, setConfirmError] = useState("")

  const allFilled  = current.trim() && newPass.trim() && confirm.trim()
  const canSubmit  = !!(allFilled && !confirmError)

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
    await new Promise(r => setTimeout(r, 1000))
    setIsResetting(false)
    setCurrent(""); setNewPass(""); setConfirm("")
    setShowBanner(true)
  }

  return (
    <div>
      {showBanner && (
        <SuccessBanner
          message="Your password has been successfuly changed"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <h3 className="mb-5 text-lg font-semibold text-foreground">Change Password</h3>

      <div className="flex flex-col gap-4 max-w-[560px]">
        <PasswordInput
          label="Current Password"
          value={current}
          onChange={setCurrent}
          placeholder="Enter your new password"
        />
        <PasswordInput
          label="Create new password"
          value={newPass}
          onChange={v => { setNewPass(v); if (confirmError) setConfirmError("") }}
          placeholder="Enter your new password"
        />

        {/* Confirm — with mismatch error */}
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
              placeholder="Confirm password"
              className={cn(
                "h-12 rounded-xl pr-11 focus-visible:ring-[#F97316] text-sm",
                confirmError ? "border-red-400 focus-visible:ring-red-300" : "border-gray-200"
              )}
            />
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="mt-6">
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general")

  const headings: Record<Tab, { page: string; section: string; sub: string }> = {
    general:  { page: "Settings",         section: "Profile Settings",  sub: "Make chnages to your profile information" },
    security: { page: "General Settings", section: "Security Settings", sub: "Make chnages to your password information" },
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
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          {/* Page title */}
          <h1 className="mb-5 text-2xl font-bold text-foreground">{h.page}</h1>

          {/* Settings card */}
          <div className="w-full max-w-8xl rounded-xl border bg-card p-6 ">
            {/* Section header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">{h.section}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{h.sub}</p>
            </div>

            {/* Tabs */}
            <TabBar active={tab} onChange={setTab} />

            {/* Tab content */}
            {tab === "general"  && <GeneralTab />}
            {tab === "security" && <SecurityTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}