// components/guards/ProtectedRoute.tsx
//
// Next.js App Router version.
// ─────────────────────────────────────────────────────────────────────────────
// PATTERN:
//   • Server-side protection  → use middleware.ts  (best for SSR routes)
//   • Client-side protection  → use these components (for client components
//                               that need Redux state)
//
// USAGE IN LAYOUTS:
//   // app/admin/layout.tsx
//   import { AdminGuard } from "@/components/guards/ProtectedRoute";
//   export default function AdminLayout({ children }) {
//     return <AdminGuard>{children}</AdminGuard>;
//   }
//
//   // app/vendor/layout.tsx
//   import { VendorGuard } from "@/components/guards/ProtectedRoute";
//   export default function VendorLayout({ children }) {
//     return <VendorGuard>{children}</VendorGuard>;
//   }

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

// ─── Loading spinner ────────────────────────────────────────────────────────

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

// ─── Core guard ─────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  /** Roles allowed to view this content. Omit to allow any authenticated user. */
  roles?: UserRole[];
  /** Redirect destination when not authenticated. Default: /login */
  loginPath?: string;
  /** Redirect destination when role check fails. Default: /403 */
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

  // Fire checkAuth once on mount to validate the token server-side
  const checkedRef = useRef(false);
  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch]);

  // Wait for redux-persist rehydration + token check
  useEffect(() => {
    if (initialLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(loginPath);
      return;
    }

    if (roles && roles.length > 0) {
      const userRole = user.userType as UserRole;
      if (!roles.includes(userRole)) {
        router.replace(forbiddenPath);
      }
    }
  }, [initialLoading, isAuthenticated, user, roles, loginPath, forbiddenPath, router]);

  // Show spinner while still loading
  if (initialLoading) return <AuthLoadingScreen />;

  // Don't render children until we know auth is valid
  if (!isAuthenticated || !user) return <AuthLoadingScreen />;

  // Role check failed — show spinner while redirect fires
  if (roles && roles.length > 0) {
    const userRole = user.userType as UserRole;
    if (!roles.includes(userRole)) return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

/** Protect /admin/* — ADMIN and STAFF only */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["ADMIN", "STAFF"]}>
      {children}
    </ProtectedRoute>
  );
}

/** Protect /vendor/* — VENDOR only */
export function VendorGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["VENDOR"]}>
      {children}
    </ProtectedRoute>
  );
}

/** Protect /marketer/* — MARKETER only */
export function MarketerGuard({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["MARKETER"]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Wrap auth pages (/login, /forgot-password, etc.)
 * Redirects already-authenticated users to their dashboard.
 */
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initialLoading = useAppSelector(selectInitialLoading);

  useEffect(() => {
    if (initialLoading || !isAuthenticated || !user) return;

    const roleRedirects: Record<string, string> = {
      ADMIN: "/admin/dashboard",
      STAFF: "/admin/dashboard",
      VENDOR: "/vendor/dashboard",
      MARKETER: "/marketer/dashboard",
    };
    router.replace(roleRedirects[user.userType] ?? "/dashboard");
  }, [initialLoading, isAuthenticated, user, router]);

  if (initialLoading) return <AuthLoadingScreen />;

  // If authenticated, show spinner while redirect fires
  if (isAuthenticated && user) return <AuthLoadingScreen />;

  return <>{children}</>;
}