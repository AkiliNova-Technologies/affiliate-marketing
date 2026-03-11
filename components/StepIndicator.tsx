"use client";
import React from "react";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 1-based
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 === currentStep
              ? "bg-orange-400 w-8"
              : i + 1 < currentStep
              ? "bg-orange-300 w-6"
              : "bg-gray-300 w-6"
          }`}
        />
      ))}
    </div>
  );
}