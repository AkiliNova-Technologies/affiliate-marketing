"use client";
import React, { useState } from "react";
import AuthLayout from "@/layout/AuthLayout"; // adjust import path as needed
import LeftPanelContent from "@/components/LeftPanelContent";
import GetStarted from "@/components/GetStarted";
import VerifyEmail from "@/components/VerifyEmail";
import PhoneNumber from "@/components/PhoneNumber";
import VerifyPhone from "@/components/VerifyPhone";
import LastInfo from "@/components/LastInfo";
import RegistrationSuccess from "@/components/RegistrationSuccess";
import RegistrationLayout from "@/layout/RegistrationLayout";
import { useRouter } from "next/navigation";

type Step =
  | "get-started"
  | "verify-email"
  | "phone"
  | "verify-phone"
  | "last-info"
  | "success";

const STEP_NUMBER: Record<Step, number> = {
  "get-started": 1,
  "verify-email": 2,
  phone: 3,
  "verify-phone": 4,
  "last-info": 5,
  success: 6,
};

export default function MarketerRegistrationPage() {
  const [step, setStep] = useState<Step>("get-started");
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "256",
  });

  if (step === "success") {
    return (
      <RegistrationSuccess
        onSignIn={() => {
          router.push("/auth/login");
        }}
      />
    );
  }

  const stepNumber = STEP_NUMBER[step];

  return (
    <RegistrationLayout>
      <div className="min-h-screen flex flex-col items-center justify-center space-y-16 bg-gray-100 p-4">
        <div className="relative flex items-center flex-col justify-center w-full border bg-[#faf5f0]">
          <div className="relative w-full max-w-[880px] flex rounded-2xl overflow-hidden shadow-lg">
            {/* Top panel */}
            <div className="absolute border w-full h-12 left-0 top-0 z-index-99 bg-red-400">
              <img
                src="/auth-bg.png"
                alt="Top Panel Registration Image"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Left panel */}
            <div className="hidden md:block w-[38%] relative min-h-[450px]">
              <div className="absolute inset-0 z-index-1" />
              <LeftPanelContent step={stepNumber} />
            </div>

            {/* Right panel */}
            <div className="flex-1 bg-[#faf5f0] px-10 py-10 flex flex-col justify-center min-h-[450px] max-h-[500px] overflow-y-auto">
              {step === "get-started" && (
                <GetStarted
                  onNext={(data) => {
                    setFormData((p) => ({ ...p, ...data }));
                    setStep("verify-email");
                  }}
                />
              )}
              {step === "verify-email" && (
                <VerifyEmail
                  email={formData.email}
                  onNext={() => setStep("phone")}
                  onBack={() => setStep("get-started")}
                />
              )}
              {step === "phone" && (
                <PhoneNumber
                  onNext={(phone, countryCode) => {
                    setFormData((p) => ({ ...p, phone, countryCode }));
                    setStep("verify-phone");
                  }}
                  onBack={() => setStep("verify-email")}
                />
              )}
              {step === "verify-phone" && (
                <VerifyPhone
                  phone={formData.phone}
                  countryCode={formData.countryCode}
                  onNext={() => setStep("last-info")}
                  onBack={() => setStep("phone")}
                />
              )}
              {step === "last-info" && (
                <LastInfo onSubmit={() => setStep("success")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </RegistrationLayout>
  );
}
