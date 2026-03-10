"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-16 bg-gray-100 p-4">
      <div className="absolute top-1/9 left-0 text-center w-full">
        <img src="/logo.png" alt="Tek Affiliate Logo" className="mx-auto" />
      </div>

      <div className="flex items-center flex-col justify-center w-full">
        <div className="w-full max-w-[880px] flex rounded-2xl overflow-hidden shadow-lg">
          {/* ── Left panel ───────────────────────────────── */}
          <div className="hidden md:block w-[38%] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500" />

            <img
              src="/auth-bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* ── Right panel (form) ────────────────────────── */}
          <div className="flex-1 bg-[#faf5f0] px-10 py-12 flex flex-col justify-center min-h-[450px] max-h-[450px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
