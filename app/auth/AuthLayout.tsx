"use client";

import React from "react";

/**
 * AuthLayout
 * Wraps every auth screen with the two-column layout:
 *   Left  → warm cloud/network illustration panel
 *   Right → form content (children)
 *
 * Drop your cloud background image at /public/images/auth-bg.jpg
 * (or swap the url below for any CDN image).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[880px] flex rounded-2xl overflow-hidden shadow-xl">

        {/* ── Left panel ───────────────────────────────── */}
        <div className="hidden md:block w-[38%] relative">
          {/* Gradient fallback (shown if image is missing) */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500" />

          {/* Optional: replace src with your real background image */}
          <img
            src="/auth-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          
        </div>

        {/* ── Right panel (form) ────────────────────────── */}
        <div className="flex-1 bg-[#faf5f0] px-10 py-12 flex flex-col justify-center">
          {children}
        </div>

      </div>
    </div>
  );
}