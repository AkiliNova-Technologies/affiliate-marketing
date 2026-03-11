"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layout/AuthLayout";
import { useReduxAuth } from "@/hooks/useReduxAuth";

export default function CreatePasswordPage() {
  const { activateVendorAccount, loading } = useReduxAuth();
  const searchParams = useSearchParams();

  const emailOtp = searchParams.get("emailOtp") ?? "";
  const phoneOtp = searchParams.get("phoneOtp") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const passwordsMatch = password === confirm;
  const isValid = password.length >= 8 && passwordsMatch && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!emailOtp || !phoneOtp) { setError("Invalid activation link. Please contact support."); return; }

    setError("");
    try {
      await activateVendorAccount({ emailOtp, phoneOtp, password });
    } catch {
      // error toast already fired inside the hook
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Create your password
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? "Creating…" : "Create Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}