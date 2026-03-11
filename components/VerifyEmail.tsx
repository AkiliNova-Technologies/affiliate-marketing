"use client";
import React, { useState, useEffect } from "react";
import StepIndicator from "./StepIndicator";
import OtpInput from "./OtpInput";
import { Button } from "@/components/ui/button";

interface VerifyEmailProps {
  email: string;
  onNext: (otp: string) => void;
  onBack: () => void;
}

export default function VerifyEmail({ email, onNext, onBack }: VerifyEmailProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(30);

  const isComplete = otp.every((d) => d !== "");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(Array(6).fill(""));
  };

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={2} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify your email</h2>
      <p className="text-sm text-gray-500 mb-6">
        We sent a 6-digit code to the email to{" "}
        <span className="font-medium text-gray-700">{email}</span>
      </p>

      <div className="mb-6">
        <OtpInput value={otp} onChange={setOtp} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-md border-gray-400 text-gray-700 hover:bg-gray-50 bg-transparent"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext(otp.join(""))}
          disabled={!isComplete}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md px-8 font-medium transition-colors"
        >
          Continue
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Didn&apos;t get the code?{" "}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="font-bold underline text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
        </button>
      </p>
    </div>
  );
}