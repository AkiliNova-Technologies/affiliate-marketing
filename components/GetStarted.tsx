"use client";
import React, { useState } from "react";
import StepIndicator from "./StepIndicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface GetStartedProps {
  onNext: (data: { firstName: string; lastName: string; email: string }) => void;
}

export default function GetStarted({ onNext }: GetStartedProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const isValid = firstName.trim() && lastName.trim() && email.includes("@");

  const handleSubmit = () => {
    if (isValid) onNext({ firstName, lastName, email });
  };

  return (
    <div>
      <StepIndicator totalSteps={5} currentStep={1} />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Get Started</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your Identity details to get started</p>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            First Name <span className="text-orange-400">*</span>
          </Label>
          <Input
            placeholder="Your First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border-orange-200 focus-visible:ring-orange-400 bg-white"
          />
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Last Name <span className="text-orange-400">*</span>
          </Label>
          <Input
            placeholder="Your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border-orange-200 focus-visible:ring-orange-400 bg-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Email <span className="text-orange-400">*</span>
        </Label>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-orange-200 focus-visible:ring-orange-400 bg-white"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md py-3 font-medium transition-colors"
      >
        Next
      </Button>
    </div>
  );
}