"use client";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/layout/AuthLayout";
import { useReduxAuth } from "@/hooks/useReduxAuth";

export default function CheckEmailPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "your email";
  const { requestPasswordReset, loading } = useReduxAuth();

  async function handleResend() {
    try {
      await requestPasswordReset(email);
    } catch {
      // toast already handled inside the hook
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Check your email
      </h1>

      <div className="flex justify-center mb-6 h-32 items-center object-contain">
        <img src="/check-email.png" alt="" className="h-54 w-54 object-contain" />
      </div>

      <p className="text-sm text-center text-[#6b5b5b] mb-3 leading-relaxed">
        We have sent a password reset link to your email
      </p>
      <p className="text-sm text-center text-[#3b2f2f] mb-6 leading-relaxed">
        <strong>Did you receive the email?</strong> If not, check your spam folder
      </p>

      <button
        onClick={handleResend}
        disabled={loading}
        className="text-sm font-semibold underline underline-offset-2 text-[#3b2f2f]
                   mx-auto block hover:text-amber-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send email again"}
      </button>
    </AuthLayout>
  );
}