"use client";

import React from "react";

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-16 bg-gray-100 p-4">
      <div className="absolute top-1/11 sm:top-1/10 md:top-1/10 lg:top-1/12 xl:top-1/14  left-0 text-center w-full">
        <img
          src="/Mono_dark.svg"
          alt="Tek Affiliate Logo"
          className="mx-auto sm:h-8 md:h-12 lg:h-14"
        />
      </div>

      <div className="flex items-center flex-col justify-center w-full">
        {/* ── Right panel (form) ────────────────────────── */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
