"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layout/AuthLayout";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    // TODO: call your password-reset API here
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-2 text-center">
        Forgot Password?
      </h1>
      <p className="text-sm text-center text-[#6b5b5b] mb-6 leading-relaxed">
        Enter the email address used to create this account to start the reset process
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm text-[#3b2f2f]">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-amber-400 focus-visible:ring-amber-400 bg-white rounded-xl h-12"
          />
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Sending…" : "Receive a password reset Link"}
        </Button>
      </form>
    </AuthLayout>
  );
}