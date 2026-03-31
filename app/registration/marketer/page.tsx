"use client";
import React, { useState } from "react";
import LeftPanelContent from "@/components/LeftPanelContent";
import GetStarted from "@/components/GetStarted";
import VerifyEmail from "@/components/VerifyEmail";
import PhoneNumber from "@/components/PhoneNumber";
import VerifyPhone from "@/components/VerifyPhone";
import LastInfo from "@/components/LastInfo";
import RegistrationSuccess from "@/components/RegistrationSuccess";
import RegistrationLayout from "@/layout/RegistrationLayout";
import { useRouter } from "next/navigation";
import { useReduxAuth } from "@/hooks/useReduxAuth";

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

  const {
    marketerRegistration,
    marketerStep1InitEmail,
    marketerStep2VerifyEmail,
    marketerResendOTP,
    marketerStep3InitPhone,
    marketerTriggerPhoneOtp,
    marketerResendPhoneOTP,
    marketerVerifyPhone,
    marketerStep4Finalize,
    clearMarketerFlow,
    checkFieldUniqueness,
    loading,
  } = useReduxAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "256",
  });

  // ── Step 1 → 2: initiate email OTP ─────────────────────────────────────────
  const handleGetStarted = async (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    try {
      await marketerStep1InitEmail(data.email, data.firstName, data.lastName);
      setFormData((p) => ({ ...p, ...data }));
      setStep("verify-email");
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 2 → 3: verify email OTP ───────────────────────────────────────────
  const handleVerifyEmail = async (otp: string) => {
    try {
      const flowId = marketerRegistration.registrationFlowId;
      if (!flowId) throw new Error("Registration flow ID missing");
      await marketerStep2VerifyEmail(flowId, otp);
      setStep("phone");
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 2: resend email OTP ────────────────────────────────────────────────
  const handleResendEmailOtp = async () => {
    try {
      await marketerResendOTP(formData.email);
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 3 → 4: capture phone then trigger first phone OTP ─────────────────
  const handlePhoneNext = async (phone: string, countryCode: string) => {
    try {
      const flowId = marketerRegistration.registrationFlowId;
      if (!flowId) throw new Error("Registration flow ID missing");
      await marketerStep3InitPhone(flowId, `+${countryCode}${phone}`);
      await marketerTriggerPhoneOtp(flowId);
      setFormData((p) => ({ ...p, phone, countryCode }));
      setStep("verify-phone");
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 4: resend phone OTP ────────────────────────────────────────────────
  const handleResendPhoneOtp = async () => {
    try {
      const flowId = marketerRegistration.registrationFlowId;
      if (!flowId) return;
      await marketerResendPhoneOTP(flowId);
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 4 → 5: verify phone OTP ───────────────────────────────────────────
  const handleVerifyPhone = async (otp: string) => {
    try {
      const flowId = marketerRegistration.registrationFlowId;
      if (!flowId) throw new Error("Registration flow ID missing");
      await marketerVerifyPhone(flowId, otp);
      setStep("last-info");
    } catch {
      // error already toasted by hook
    }
  };

  // ── Step 5 → success: finalize account ─────────────────────────────────────
  const handleFinalize = async (data: {
    nickname: string;
    password: string;
  }) => {
    try {
      const flowId = marketerRegistration.registrationFlowId;
      if (!flowId) throw new Error("Registration flow ID missing");
      await marketerStep4Finalize({
        registrationFlowId: flowId,
        password: data.password,
        nickname: data.nickname,
      });
      setStep("success");
    } catch {
      // error already toasted by hook
    }
  };

  if (step === "success") {
    return (
      <RegistrationSuccess
        onSignIn={() => {
          clearMarketerFlow();
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
                  onNext={handleGetStarted}
                  onCheckEmail={(email) => checkFieldUniqueness({ email })}
                  loading={loading}
                />
              )}

              {step === "verify-email" && (
                <VerifyEmail
                  email={formData.email}
                  onNext={handleVerifyEmail}
                  onBack={() => setStep("get-started")}
                  onResend={handleResendEmailOtp}
                  loading={loading}
                />
              )}

              {step === "phone" && (
                <PhoneNumber
                  onNext={handlePhoneNext}
                  onBack={() => setStep("verify-email")}
                  onCheckPhone={(phone, cc) =>
                    checkFieldUniqueness({ phone: `+${cc}${phone}` })
                  }
                  loading={loading}
                />
              )}

              {step === "verify-phone" && (
                <VerifyPhone
                  phone={formData.phone}
                  countryCode={formData.countryCode}
                  onNext={handleVerifyPhone}
                  onBack={() => setStep("phone")}
                  onResend={handleResendPhoneOtp}
                  loading={loading}
                />
              )}

              {step === "last-info" && (
                <LastInfo
                  onSubmit={handleFinalize}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </RegistrationLayout>
  );
}