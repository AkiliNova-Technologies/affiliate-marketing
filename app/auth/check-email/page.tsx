"use client";

import { useSearchParams } from "next/navigation";
import AuthLayout from "@/layout/AuthLayout";

export default function CheckEmailPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "your email";

  async function handleResend() {
    // TODO: call your resend API
    alert(`Reset link re-sent to ${email}`);
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Check your email
      </h1>

      {/* Envelope illustration */}
      <div className="flex justify-center mb-6 h-32 items-center object-contain">
        <img src="/check-email.png" alt="" className="h-54 w-54 object-contain"/>
      </div>

      <p className="text-sm text-center text-[#6b5b5b] mb-3 leading-relaxed">
        We have sent a password reset link to your email
      </p>
      <p className="text-sm text-center text-[#3b2f2f] mb-6 leading-relaxed">
        <strong>Did you receive the email?</strong> If not, check your spam folder
      </p>

      <button
        onClick={handleResend}
        className="text-sm font-semibold underline underline-offset-2 text-[#3b2f2f] mx-auto block hover:text-amber-700 transition-colors"
      >
        Send email again
      </button>
    </AuthLayout>
  );
}