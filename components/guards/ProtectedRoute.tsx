"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  checkAuth,
  selectCurrentUser,
  selectIsAuthenticated,
  selectInitialLoading,
  type UserRole,
} from "@/redux/slices/authSlice";

// ─── Loading spinner ─────────────────────────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 animate-spin rounded-full border-4 border-[#F97316] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    </div>
  );
}

// ─── Role → dashboard mapping (single source of truth) ──────────────────────

export const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN:       "/admin/dashboard",
  STAFF:       "/admin/dashboard",
  VENDOR:      "/vendor/dashboard",
  MARKETER:    "/marketer/dashboard",
};

// ─── Core guard ──────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  roles?: string[];
  loginPath?: string;
  forbiddenPath?: string;
  children: React.ReactNode;
}

export function ProtectedRoute({
  roles,
  loginPath = "/auth/login",
  forbiddenPath = "/403",
  children,
}: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialLoading = useAppSelector(selectInitialLoading);

  const checkedRef = useRef(false);
  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    if (initialLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(loginPath);
      return;
    }

    if (roles && roles.length > 0 && !roles.includes(user.userType)) {
      router.replace(forbiddenPath);
    }
  }, [initialLoading, isAuthenticated, user, roles, loginPath, forbiddenPath, router]);

  if (initialLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated || !user) return <AuthLoadingScreen />;
  if (roles && roles.length > 0 && !roles.includes(user.userType)) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "STAFF"]}>
      {children}
    </ProtectedRoute>
  );
}

export function VendorGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["VENDOR"]}>
      {children}
    </ProtectedRoute>
  );
}

export function MarketerGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["MARKETER"]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Wrap auth pages — redirects already-authenticated users to their dashboard.
 */
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialLoading = useAppSelector(selectInitialLoading);

  useEffect(() => {
    if (initialLoading || !isAuthenticated || !user) return;
    router.replace(ROLE_DASHBOARDS[user.userType] ?? "/dashboard");
  }, [initialLoading, isAuthenticated, user, router]);

  if (initialLoading) return <AuthLoadingScreen />;
  if (isAuthenticated && user) return <AuthLoadingScreen />;

  return <>{children}</>;
}