"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AuthLayout from "@/layout/AuthLayout";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { ROLE_DASHBOARDS } from "@/components/guards/ProtectedRoute";

export default function LoginPage() {
  const router = useRouter();
  const { signin, loading } = useReduxAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const isValid = email.trim() !== "" && password.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    try {
      const result = await signin(email, password);
      const destination = ROLE_DASHBOARDS[result.user.userType] ?? "/dashboard";
      router.push(destination);
    } catch {
      // error toast already fired inside signin
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Sign In to your account
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm text-[#3b2f2f]">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-amber-400 focus-visible:ring-amber-400 bg-white rounded-xl h-12"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-sm text-[#3b2f2f]">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-amber-400 focus-visible:ring-amber-400 bg-white rounded-xl h-12"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Switch
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="remember" className="text-sm text-[#3b2f2f] cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="/auth/forgot-password" className="text-sm text-amber-700 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in…" : "Get started"}
        </Button>
      </form>
    </AuthLayout>
  );
}