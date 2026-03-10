"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layout/AuthLayout";

export default function CreatePasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = password === confirm;
  const isValid = password.length >= 8 && passwordsMatch && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      if (!passwordsMatch) setError("Passwords do not match.");
      else setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    // TODO: call your API with { token, password }
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/auth/reset-success");
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Create a new password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Create Password */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-sm text-[#3b2f2f]">
            Create Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-amber-400 focus-visible:ring-amber-400 bg-white rounded-xl h-12"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="confirm" className="text-sm text-[#3b2f2f]">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirm"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`bg-white rounded-xl h-12 ${
              confirm.length > 0 && !passwordsMatch
                ? "border-red-400 focus-visible:ring-red-400"
                : "border-amber-400 focus-visible:ring-amber-400"
            }`}
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Resetting…" : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}