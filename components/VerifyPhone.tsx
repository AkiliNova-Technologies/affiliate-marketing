"use client";
import React, { useState, useEffect } from "react";
import StepIndicator from "./StepIndicator";
import OtpInput from "./OtpInput";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VerifyPhoneProps {
  phone: string;
  countryCode: string;
  onNext: (otp: string) => void;
  onBack: () => void;
  onResend?: () => Promise<void>;
  loading?: boolean;
}

export default function VerifyPhone({
  phone,
  countryCode,
  onNext,
  onBack,
  onResend,
  loading = false,
}: VerifyPhoneProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);

  const isComplete = otp.every((d) => d !== "");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    try {
      await onResend?.();
      setOtp(Array(6).fill(""));
      setResendTimer(30);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={4} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify phone number</h2>
      <p className="text-sm text-gray-500 mb-6">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-gray-700">+{countryCode}{phone}</span>
      </p>

      <div className="mb-6">
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="rounded-md border-gray-400 text-gray-700 bg-transparent hover:bg-gray-50"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext(otp.join(""))}
        //   disabled={!isComplete || loading}
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md px-8 font-medium transition-colors"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Continue"}
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Didn&apos;t get the code?{" "}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || resending || loading}
          className="font-bold underline text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resending
            ? "Resending…"
            : resendTimer > 0
            ? `Resend in ${resendTimer}s`
            : "Resend"}
        </button>
      </p>
    </div>
  );
}