"use client";
import React, { useState, useEffect, useRef } from "react";
import StepIndicator from "./StepIndicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface LastInfoProps {
  onSubmit: (data: { nickname: string; password: string }) => void;
}

export default function LastInfo({ onSubmit }: LastInfoProps) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate availability check
  useEffect(() => {
    if (!nickname.trim()) { setAvailable(false); setChecking(false); return; }
    setChecking(true);
    setAvailable(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setChecking(false);
      setAvailable(true); // Simulate available
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [nickname]);

  const isValid =
    nickname.trim() &&
    available &&
    password.length >= 8 &&
    password === confirmPassword;

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
          className="border-orange-200 focus-visible:ring-orange-400 bg-white"
        />
        {(checking || available) && (
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs text-green-600">
              {checking ? "Checking Availability..." : "Checking Availability"}
            </span>
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
          className="border-orange-200 focus-visible:ring-orange-400 bg-white"
        />
      </div>

      <Button
        onClick={() => onSubmit({ nickname, password })}
        disabled={!isValid}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
      >
        Create Account
      </Button>
    </div>
  );
}