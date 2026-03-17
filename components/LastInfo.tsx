"use client";
import React, { useState, useEffect, useRef } from "react";
import StepIndicator from "./StepIndicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface LastInfoProps {
  onSubmit: (data: { nickname: string; password: string }) => void;
  loading?: boolean;
}

export default function LastInfo({ onSubmit, loading = false }: LastInfoProps) {
  const { checkFieldUniqueness } = useReduxAuth();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Availability state: null = not checked yet, true = available, false = taken
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real nickname uniqueness check, debounced 600 ms
  useEffect(() => {
    if (!nickname.trim()) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        await checkFieldUniqueness({ nickname: nickname.trim() });
        // hook resolves → nickname is unique
        setAvailable(true);
      } catch {
        // hook throws → nickname is already taken
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname, checkFieldUniqueness]);

  const passwordsMatch = password === confirmPassword;

  const isValid =
    nickname.trim() &&
    available === true &&
    password.length >= 8 &&
    passwordsMatch;

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={5} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">You&apos;re almost there!</h2>
      <p className="text-sm text-gray-500 mb-5">Enter a unique name and set your password to finalise</p>

      {/* Nickname */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Your nick-name <span className="text-orange-400">*</span>
        </Label>
        <Input
          placeholder="Enter a unique name"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
          className="border-orange-200 focus-visible:ring-orange-400 bg-white"
        />
        {/* Availability feedback */}
        {nickname.trim() && (
          <div className="flex items-center gap-1 mt-1">
            {checking && (
              <>
                <Loader2 size={13} className="text-gray-400 animate-spin" />
                <span className="text-xs text-gray-400">Checking availability…</span>
              </>
            )}
            {!checking && available === true && (
              <>
                <CheckCircle2 size={13} className="text-green-500" />
                <span className="text-xs! text-green-600">Available</span>
              </>
            )}
            {!checking && available === false && (
              <>
                <XCircle size={13} className="text-red-500" />
                <span className="text-xs text-red-500">Nickname already taken</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Create Password <span className="text-orange-400">*</span>
        </Label>
        <Input
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="border-orange-200 focus-visible:ring-orange-400 bg-white"
        />
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Confirm Password <span className="text-orange-400">*</span>
        </Label>
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className={`bg-white ${
            confirmPassword && !passwordsMatch
              ? "border-red-400 focus-visible:ring-red-400"
              : "border-orange-200 focus-visible:ring-orange-400"
          }`}
        />
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      <Button
        onClick={() => onSubmit({ nickname, password })}
        disabled={!isValid || loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Account"}
      </Button>
    </div>
  );
}