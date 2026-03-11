"use client";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const homePath = (() => {
    switch (user?.userType) {
      case "SUPER_ADMIN":
      case "ADMIN":
      case "STAFF":
        return "/admin/dashboard";
      case "VENDOR":
        return "/vendor/dashboard";
      case "MARKETER":
        return "/marketer/dashboard";
      default:
        return "/login";
    }
  })();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      {/* Lock icon */}
      <div className="flex size-24 items-center justify-center rounded-full bg-orange-50">
        <svg
          viewBox="0 0 64 64"
          className="size-14 text-[#F97316]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="12" y="30" width="40" height="26" rx="4" />
          <path d="M20 30V20a12 12 0 0 1 24 0v10" />
          <circle cx="32" cy="44" r="3" fill="currentColor" stroke="none" />
          <line x1="32" y1="47" x2="32" y2="52" />
        </svg>
      </div>

      <div className="space-y-2">
        <p className="text-6xl font-extrabold text-[#F97316]">403</p>
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="max-w-sm text-muted-foreground">
          You don't have permission to view this page. Contact your administrator
          if you think this is a mistake.
        </p>
      </div>

      {user && (
        <p className="rounded-lg border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user.email}</span>
          {" · "}
          <span className="font-medium capitalize text-[#F97316]">
            {user.userType.toLowerCase()}
          </span>
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
        <Button
          className="bg-[#F97316] text-white hover:bg-[#F97316]/90"
          onClick={() => router.push(homePath)}
        >
          Go to my dashboard
        </Button>
      </div>
    </div>
  );
}