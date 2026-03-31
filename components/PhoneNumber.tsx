"use client";
import React, { useState, useRef } from "react";
import StepIndicator from "./StepIndicator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PhoneField from "./PhoneField";

interface PhoneNumberProps {
  onNext: (phone: string, countryCode: string) => void;
  onBack: () => void;
  /**
   * Called with the raw local number + country code to check uniqueness.
   * Resolves normally if unique, throws/returns { isUnique: false } if taken.
   */
  onCheckPhone: (phone: string, countryCode: string) => Promise<any>;
  loading?: boolean;
}

export default function PhoneNumber({
  onNext,
  onBack,
  onCheckPhone,
  loading = false,
}: PhoneNumberProps) {
  const [phone, setPhone] = useState("");
  const [cc, setCc] = useState("256");
  const [phoneErr, setPhoneErr] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A valid local number is at least 7 digits after stripping non-digits
  const hasEnoughDigits = phone.replace(/\D/g, "").length >= 7;

  // ── Phone change: basic length validation + debounced uniqueness check ───────

  const handlePhoneChange = (val: string) => {
    setPhone(val);

    // Clear any previous "taken" error while editing
    if (phoneErr && phoneErr !== "This phone number is already registered") {
      setPhoneErr("");
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const digits = val.replace(/\D/g, "");
    if (digits.length < 7) return; // don't check obviously incomplete numbers

    debounceRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const res = await onCheckPhone(val, cc);
        if (res?.isUnique === false || res?.available === false) {
          setPhoneErr("This phone number is already registered");
        } else {
          setPhoneErr("");
        }
      } catch {
        setPhoneErr("This phone number is already registered");
      } finally {
        setCheckingPhone(false);
      }
    }, 600);
  };

  // Re-run the uniqueness check when country code changes (full number changes)
  const handleCcChange = (val: string) => {
    setCc(val);
    setPhoneErr("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) return;

    debounceRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const res = await onCheckPhone(phone, val);
        if (res?.isUnique === false || res?.available === false) {
          setPhoneErr("This phone number is already registered");
        } else {
          setPhoneErr("");
        }
      } catch {
        setPhoneErr("This phone number is already registered");
      } finally {
        setCheckingPhone(false);
      }
    }, 600);
  };

  const handleBlur = async () => {
    if (!hasEnoughDigits) {
      setPhoneErr("Please enter a valid phone number");
      return;
    }
    // Uniqueness is already handled by the debounce above, but run
    // synchronously on blur in case the debounce hasn't fired yet.
    if (!checkingPhone && !phoneErr) {
      setCheckingPhone(true);
      try {
        const res = await onCheckPhone(phone, cc);
        if (res?.isUnique === false || res?.available === false) {
          setPhoneErr("This phone number is already registered");
        } else {
          setPhoneErr("");
        }
      } catch {
        setPhoneErr("This phone number is already registered");
      } finally {
        setCheckingPhone(false);
      }
    }
  };

  const handleContinue = async () => {
    if (!hasEnoughDigits) {
      setPhoneErr("Please enter a valid phone number");
      return;
    }
    if (phoneErr) return;

    // Final synchronous uniqueness check (edge-case: pasted number → clicked Continue)
    setCheckingPhone(true);
    try {
      const res = await onCheckPhone(phone, cc);
      if (res?.isUnique === false || res?.available === false) {
        setPhoneErr("This phone number is already registered");
        return;
      }
      setPhoneErr("");
    } catch {
      setPhoneErr("This phone number is already registered");
      return;
    } finally {
      setCheckingPhone(false);
    }

    onNext(phone, cc);
  };

  const canContinue =
    hasEnoughDigits && !phoneErr && !checkingPhone && !loading;

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
        <div className={phoneErr ? "ring-1 ring-red-400 rounded-lg" : ""}>
          <PhoneField
            phone={phone}
            setPhone={handlePhoneChange}
            cc={cc}
            setCc={handleCcChange}
            disabled={loading}
          />
        </div>
        {/* Inline feedback */}
        {checkingPhone && (
          <p className="mt-1 flex items-center gap-1 text-xs text-orange-500">
            <Loader2 className="size-3 animate-spin" />
            Checking availability…
          </p>
        )}
        {!checkingPhone && phoneErr && (
          <p className="mt-1 text-xs text-red-500">{phoneErr}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading || checkingPhone}
          className="rounded-md border-gray-400 text-gray-700 hover:bg-gray-50 bg-transparent"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
        >
          {loading || checkingPhone ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}