"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, WifiOff, ServerCrash } from "lucide-react";
import AuthLayout from "@/layout/AuthLayout";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { ROLE_DASHBOARDS } from "@/components/guards/ProtectedRoute";

// ─── Error classifier ─────────────────────────────────────────────────────────

type SignInError =
  | { type: "credentials"; message: string }
  | { type: "server";      message: string }
  | { type: "network";     message: string }
  | { type: "unknown";     message: string };

function classifyError(err: any): SignInError {
  // The error coming out of the hook is either a plain string (from
  // handleApiError) or an Axios-style error object — handle both.
  const status: number | undefined =
    err?.response?.status ?? err?.status ?? err?.code;

  const serverMessage: string =
    err?.response?.data?.message ??
    err?.message ??
    (typeof err === "string" ? err : "");

  // 401 / 403 → wrong email or password
  if (status === 401 || status === 403) {
    return {
      type: "credentials",
      message: "Incorrect email or password. Please try again.",
    };
  }

  // 502 / 503 / 504 → backend is down or gateway error
  if (status === 502 || status === 503 || status === 504) {
    return {
      type: "server",
      message:
        "Our servers are temporarily unavailable. Please wait a moment and try again.",
    };
  }

  // Network error (no response at all)
  if (
    err?.code === "ERR_NETWORK" ||
    err?.message === "Network Error" ||
    !navigator.onLine
  ) {
    return {
      type: "network",
      message: "No internet connection. Please check your network and retry.",
    };
  }

  // Any other server message we can surface
  if (serverMessage) {
    return { type: "unknown", message: serverMessage };
  }

  return {
    type: "unknown",
    message: "Something went wrong. Please try again.",
  };
}

// ─── Inline error banner ──────────────────────────────────────────────────────

function ErrorBanner({ error }: { error: SignInError }) {
  const icons = {
    credentials: <AlertCircle className="size-4 shrink-0 mt-0.5" />,
    server:      <ServerCrash className="size-4 shrink-0 mt-0.5" />,
    network:     <WifiOff className="size-4 shrink-0 mt-0.5" />,
    unknown:     <AlertCircle className="size-4 shrink-0 mt-0.5" />,
  };

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {icons[error.type]}
      <p className="leading-snug">{error.message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignInPage() {
  const router = useRouter();
  const { signin, loading } = useReduxAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [signInError, setSignInError] = useState<SignInError | null>(null);

  const isValid = email.trim() !== "" && password.trim() !== "";

  // Clear the inline error whenever the user starts editing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (signInError) setSignInError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (signInError) setSignInError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSignInError(null);

    try {
      const result = await signin(email, password);
      const destination = ROLE_DASHBOARDS[result.user.userType] ?? "/dashboard";
      router.push(destination);
    } catch (err: any) {
      // signin() already fires a toast, but we also render the error inline
      // so the user can read it without the toast disappearing.
      setSignInError(classifyError(err));
    }
  }

  // Highlight the input borders red when we have a credentials error
  const inputErrClass =
    signInError?.type === "credentials"
      ? "border-red-400 focus-visible:ring-red-300"
      : "border-amber-400 focus-visible:ring-amber-400";

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-[#3b2f2f] mb-6 text-center">
        Sign In to your account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Inline error banner ── */}
        {signInError && <ErrorBanner error={signInError} />}

        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm text-[#3b2f2f]">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-white rounded-xl h-12 ${inputErrClass}`}
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
            onChange={handlePasswordChange}
            className={`bg-white rounded-xl h-12 ${inputErrClass}`}
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
            <Label
              htmlFor="remember"
              className="text-sm text-[#3b2f2f] cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-amber-700 hover:underline"
          >
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