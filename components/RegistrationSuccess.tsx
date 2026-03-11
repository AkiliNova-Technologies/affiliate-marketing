"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import RegistrationLayout from "@/layout/RegistrationLayout";

interface RegistrationSuccessProps {
  onSignIn: () => void;
}

export default function RegistrationSuccess({
  onSignIn,
}: RegistrationSuccessProps) {
  return (
    <RegistrationLayout>
      <div className="flex flex-col items-center justify-center bg-[#f5f0eb] p-12 rounded-2xl shadow-lg w-xl max-w-[450px]">

        {/* Card */}
        <div className="flex justify-center mb-6 h-32 items-center object-contain">
          <img src="/success.png" alt="" className="h-54 w-54 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-snug">
          Your account was
          <br />
          successfully created
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          You can now sign in to your dashboard
        </p>

        <Button
          onClick={onSignIn}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-medium"
        >
          Sign in to your account
        </Button>
      </div>
    </RegistrationLayout>
  );
}
