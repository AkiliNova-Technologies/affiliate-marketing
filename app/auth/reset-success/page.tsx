// app/(auth)/reset-success/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layout/AuthLayout";

export default function ResetSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout>
      {/* High-five illustration */}
     <div className="flex justify-center mb-6 h-32 items-center object-contain">
        <img src="/success.png" alt="" className="h-54 w-54 object-contain"/>
      </div>

      <h1 className="text-2xl font-bold text-[#3b2f2f] mb-2 text-center leading-snug">
        Your password reset was successful
      </h1>
      <p className="text-sm text-center text-[#6b5b5b] mb-8">
        You can now sign in with your new password
      </p>

      <Button
        onClick={() => router.push("/auth/login")}
        className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white transition-colors"
      >
        Sign In
      </Button>
    </AuthLayout>
  );
}