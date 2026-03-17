"use client";
import React, { useState } from "react";
import StepIndicator from "./StepIndicator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PhoneField from "./PhoneField";

interface PhoneNumberProps {
  onNext: (phone: string, countryCode: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function PhoneNumber({ onNext, onBack, loading = false }: PhoneNumberProps) {
  const [phone, setPhone] = useState("");
  const [cc, setCc] = useState("256");

  const isValid = phone.replace(/\D/g, "").length >= 9;

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={3} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Phone number</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your phone contact details</p>

      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Phone <span className="text-orange-400">*</span>
        </Label>
        {/* PhoneField manages country code + number internally; cc/setCc kept in sync */}
        <PhoneField phone={phone} setPhone={setPhone} cc={cc} setCc={setCc} disabled={loading} />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="rounded-md border-gray-400 text-gray-700 hover:bg-gray-50 bg-transparent"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext(phone, cc)}
          disabled={!isValid || loading}
          className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Continue"}
        </Button>
      </div>
    </div>
  );
}