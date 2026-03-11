"use client";
import React, { useState } from "react";
import StepIndicator from "./StepIndicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import PhoneField from "./PhoneField";

const COUNTRY_CODES = [
  { code: "256", flag: "🇺🇬", name: "Uganda" },
  { code: "254", flag: "🇰🇪", name: "Kenya" },
  { code: "255", flag: "🇹🇿", name: "Tanzania" },
  { code: "250", flag: "🇷🇼", name: "Rwanda" },
  { code: "1", flag: "🇺🇸", name: "USA" },
  { code: "44", flag: "🇬🇧", name: "UK" },
];

interface PhoneNumberProps {
  onNext: (phone: string, countryCode: string) => void;
  onBack: () => void;
}

export default function PhoneNumber({ onNext, onBack }: PhoneNumberProps) {
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [cc, setCc] = useState("256");

  const isValid = phone.replace(/\D/g, "").length >= 9;

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={3} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Phone number</h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your phone contact details
      </p>

      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Phone <span className="text-orange-400">*</span>
        </Label>
        <PhoneField phone={phone} setPhone={setPhone} cc={cc} setCc={setCc} />
      </div>

      <Button
        onClick={() => onNext(phone, selectedCode.code)}
        disabled={!isValid}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
      >
        Continue
      </Button>
    </div>
  );
}
