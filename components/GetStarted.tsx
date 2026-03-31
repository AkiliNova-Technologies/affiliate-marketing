"use client";
import React, { useState, useRef } from "react";
import StepIndicator from "./StepIndicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GetStartedProps {
  onNext: (data: { firstName: string; lastName: string; email: string }) => void;
  /**
   * Called with the typed email to check uniqueness against the API.
   * Should resolve normally if unique, throw (or return a value with
   * isUnique: false) if already taken.
   */
  onCheckEmail: (email: string) => Promise<any>;
  loading?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GetStarted({
  onNext,
  onCheckEmail,
  loading = false,
}: GetStartedProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Per-field error messages shown beneath each input
  const [firstNameErr, setFirstNameErr] = useState("");
  const [lastNameErr, setLastNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");

  // Tracks whether we're currently running the uniqueness check so we can
  // show a small spinner on the email field without disabling the whole form.
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Debounce timer ref so rapid typing doesn't fire many API calls
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Validation helpers ──────────────────────────────────────────────────────

  const validateFirstName = (v: string) => {
    if (!v.trim()) {
      setFirstNameErr("First name is required");
      return false;
    }
    setFirstNameErr("");
    return true;
  };

  const validateLastName = (v: string) => {
    if (!v.trim()) {
      setLastNameErr("Last name is required");
      return false;
    }
    setLastNameErr("");
    return true;
  };

  const validateEmailFormat = (v: string): boolean => {
    if (!v.trim()) {
      setEmailErr("Email is required");
      return false;
    }
    if (!EMAIL_RE.test(v)) {
      setEmailErr("Please enter a valid email address");
      return false;
    }
    setEmailErr("");
    return true;
  };

  // ── Email change: format-validate instantly, then debounce uniqueness check ─

  const handleEmailChange = (v: string) => {
    setEmail(v);

    // Clear any previous uniqueness error while user is still typing
    if (emailErr && emailErr !== "This email is already registered") {
      setEmailErr("");
    }

    // Cancel previous debounce
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);

    if (!EMAIL_RE.test(v)) return; // don't call API for invalid format

    emailDebounceRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await onCheckEmail(v);
        // API returns { isUnique: false } or similar when taken
        if (res?.isUnique === false || res?.available === false) {
          setEmailErr("This email is already registered");
        } else {
          setEmailErr("");
        }
      } catch {
        // If the check call itself throws, the API likely signals "not unique"
        setEmailErr("This email is already registered");
      } finally {
        setCheckingEmail(false);
      }
    }, 600);
  };

  // ── Email blur: format check only (uniqueness already debounced above) ──────

  const handleEmailBlur = () => {
    validateEmailFormat(email);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const fnOk = validateFirstName(firstName);
    const lnOk = validateLastName(lastName);
    const fmtOk = validateEmailFormat(email);

    if (!fnOk || !lnOk || !fmtOk) return;

    // If there's already a uniqueness error, stop here
    if (emailErr) return;

    // Run one final uniqueness check synchronously in case the debounce
    // hasn't fired yet (e.g. user pasted the email and hit Next immediately)
    if (!checkingEmail) {
      setCheckingEmail(true);
      try {
        const res = await onCheckEmail(email);
        if (res?.isUnique === false || res?.available === false) {
          setEmailErr("This email is already registered");
          return;
        }
        setEmailErr("");
      } catch {
        setEmailErr("This email is already registered");
        return;
      } finally {
        setCheckingEmail(false);
      }
    }

    onNext({ firstName, lastName, email });
  };

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    EMAIL_RE.test(email) &&
    !emailErr &&
    !checkingEmail &&
    !loading;

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={1} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Get Started</h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your Identity details to get started
      </p>

      {/* Name row */}
      <div className="flex gap-3 mb-4">
        {/* First name */}
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            First Name <span className="text-orange-400">*</span>
          </Label>
          <Input
            placeholder="Your First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (firstNameErr) validateFirstName(e.target.value);
            }}
            onBlur={() => validateFirstName(firstName)}
            disabled={loading}
            className={`border-orange-200 focus-visible:ring-orange-400 bg-white ${
              firstNameErr ? "border-red-400 focus-visible:ring-red-400" : ""
            }`}
          />
          {firstNameErr && (
            <p className="mt-1 text-xs text-red-500">{firstNameErr}</p>
          )}
        </div>

        {/* Last name */}
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Last Name <span className="text-orange-400">*</span>
          </Label>
          <Input
            placeholder="Your last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (lastNameErr) validateLastName(e.target.value);
            }}
            onBlur={() => validateLastName(lastName)}
            disabled={loading}
            className={`border-orange-200 focus-visible:ring-orange-400 bg-white ${
              lastNameErr ? "border-red-400 focus-visible:ring-red-400" : ""
            }`}
          />
          {lastNameErr && (
            <p className="mt-1 text-xs text-red-500">{lastNameErr}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Email <span className="text-orange-400">*</span>
        </Label>
        <div className="relative">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={loading}
            className={`border-orange-200 focus-visible:ring-orange-400 bg-white pr-8 ${
              emailErr ? "border-red-400 focus-visible:ring-red-400" : ""
            }`}
          />
          {/* Inline spinner while checking uniqueness */}
          {checkingEmail && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-orange-400" />
          )}
        </div>
        {emailErr && (
          <p className="mt-1 text-xs text-red-500">{emailErr}</p>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
      >
        {loading || checkingEmail ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Next"
        )}
      </Button>
    </div>
  );
}