// redux/hooks/useReduxAuth.ts
"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  login,
  logoutAsync,
  logoutAll,
  checkAuth,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  activateVendor,
  fetchSessions,
  revokeSession,
  checkUniqueness,
  marketerInitEmail,
  marketerVerifyEmail,
  marketerResendEmailOtp,
  marketerInitPhone,
  marketerTriggerPhoneOtp    as triggerPhoneOtpThunk,
  marketerResendPhoneOtp     as resendPhoneOtpThunk,
  marketerVerifyPhone        as verifyPhoneThunk,
  marketerFinalize,
  logout,
  clearError,
  updateUser,
  loadUserFromStorage,
  resetMarketerRegistration,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectInitialLoading,
  selectSessions,
  selectMarketerRegistration,
  selectPasswordReset,
  selectUserRole,
  type User,
} from "@/redux/slices/authSlice";

export function useReduxAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user                 = useAppSelector(selectCurrentUser);
  const isAuthenticated      = useAppSelector(selectIsAuthenticated);
  const loading              = useAppSelector(selectAuthLoading);
  const initialLoading       = useAppSelector(selectInitialLoading);
  const error                = useAppSelector(selectAuthError);
  const sessions             = useAppSelector(selectSessions);
  const marketerRegistration = useAppSelector(selectMarketerRegistration);
  const passwordReset        = useAppSelector(selectPasswordReset);
  const userRole             = useAppSelector(selectUserRole);

  // ── On mount: rehydrate from persist ────────────────────────────────────────
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // ── Core auth ────────────────────────────────────────────────────────────────

  const signin = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await dispatch(login({ email, password })).unwrap();
        toast.success("Login successful!");
        return result;
      } catch (err: any) {
        toast.error(err || "Login failed");
        throw err;
      }
    },
    [dispatch],
  );

  const signout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch {
      dispatch(logout());
      router.push("/auth/login");
    }
  }, [dispatch, router]);

  const signoutAllDevices = useCallback(async () => {
    try {
      await dispatch(logoutAll()).unwrap();
      toast.success("Logged out from all devices");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err || "Failed to logout from all devices");
    }
  }, [dispatch, router]);

  const verifyAuth = useCallback(async () => {
    try {
      await dispatch(checkAuth()).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      await dispatch(refreshAccessToken()).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  const updateCurrentUser = useCallback(
    (userData: Partial<User>) => {
      dispatch(updateUser(userData));
    },
    [dispatch],
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ── Password management ──────────────────────────────────────────────────────

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        const result = await dispatch(forgotPassword({ email })).unwrap();
        toast.success(result.message || "Password reset OTP sent!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to send password reset OTP");
        throw err;
      }
    },
    [dispatch],
  );

  const resetPasswordWithOTP = useCallback(
    async (email: string, otp: string, newPassword: string) => {
      try {
        const result = await dispatch(
          resetPassword({ email, otp, newPassword }),
        ).unwrap();
        toast.success(result.message || "Password reset successful!");
        router.push("/auth/login");
        return result;
      } catch (err: any) {
        toast.error(err || "Password reset failed");
        throw err;
      }
    },
    [dispatch, router],
  );

  // ── Vendor activation ────────────────────────────────────────────────────────

  const activateVendorAccount = useCallback(
    async (payload: {
      emailOtp: string;
      phoneOtp: string;
      password: string;
      [key: string]: any;
    }) => {
      try {
        const result = await dispatch(activateVendor(payload)).unwrap();
        toast.success("Vendor account activated!");
        return result;
      } catch (err: any) {
        toast.error(err || "Vendor activation failed");
        throw err;
      }
    },
    [dispatch],
  );

  // ── Sessions ─────────────────────────────────────────────────────────────────

  const loadSessions = useCallback(async () => {
    try {
      return await dispatch(fetchSessions()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load sessions");
    }
  }, [dispatch]);

  const removeSession = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(revokeSession(sessionId)).unwrap();
        toast.success("Session revoked");
      } catch (err: any) {
        toast.error(err || "Failed to revoke session");
      }
    },
    [dispatch],
  );

  // ── Uniqueness check ─────────────────────────────────────────────────────────

  const checkFieldUniqueness = useCallback(
    async (params: { email?: string; phone?: string; nickname?: string }) => {
      try {
        return await dispatch(checkUniqueness(params)).unwrap();
      } catch (err: any) {
        throw err;
      }
    },
    [dispatch],
  );

  // ── Marketer registration ────────────────────────────────────────────────────

  /** Step 1 — POST .../init-email  → sends email OTP */
  const marketerStep1InitEmail = useCallback(
    async (email: string, firstName: string, lastName: string) => {
      try {
        const result = await dispatch(
          marketerInitEmail({ email, firstName, lastName }),
        ).unwrap();
        toast.success(result.message || "OTP sent to your email!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to send email OTP");
        throw err;
      }
    },
    [dispatch],
  );

  /** Step 2 — POST .../verify-email  → validates email OTP */
  const marketerStep2VerifyEmail = useCallback(
    async (registrationFlowId: string, otp: string) => {
      try {
        const result = await dispatch(
          marketerVerifyEmail({ registrationFlowId, otp }),
        ).unwrap();
        toast.success(result.message || "Email verified!");
        return result;
      } catch (err: any) {
        toast.error(err || "Email verification failed");
        throw err;
      }
    },
    [dispatch],
  );

  /** Resend email OTP — POST .../resend-email-otp */
  const marketerResendOTP = useCallback(
    async (email: string) => {
      try {
        const result = await dispatch(
          marketerResendEmailOtp({ email }),
        ).unwrap();
        toast.success(result.message || "OTP resent!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to resend OTP");
        throw err;
      }
    },
    [dispatch],
  );

  /** Step 3 — POST .../init-phone  → saves the phone number on the flow */
  const marketerStep3InitPhone = useCallback(
    async (registrationFlowId: string, phone: string) => {
      try {
        const result = await dispatch(
          marketerInitPhone({ registrationFlowId, phone }),
        ).unwrap();
        toast.success(result.message || "Phone saved!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to save phone number");
        throw err;
      }
    },
    [dispatch],
  );

  /** Trigger first phone OTP — POST .../trigger-phone-otp
   *  Call this immediately after marketerStep3InitPhone succeeds.
   */
  const marketerTriggerPhoneOtp = useCallback(
    async (registrationFlowId: string) => {
      try {
        const result = await dispatch(
          triggerPhoneOtpThunk({ registrationFlowId }),
        ).unwrap();
        toast.success(result.message || "OTP sent to your phone!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to send phone OTP");
        throw err;
      }
    },
    [dispatch],
  );

  /** Resend phone OTP — POST .../resend-phone-otp
   *  Use this for "Resend code" on the verify-phone screen. NOT trigger-phone-otp.
   */
  const marketerResendPhoneOTP = useCallback(
    async (registrationFlowId: string) => {
      try {
        const result = await dispatch(
          resendPhoneOtpThunk({ registrationFlowId }),
        ).unwrap();
        toast.success(result.message || "Phone OTP resent!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to resend phone OTP");
        throw err;
      }
    },
    [dispatch],
  );

  /** Step 4 — POST .../verify-phone  → validates SMS OTP server-side */
  const marketerVerifyPhone = useCallback(
    async (registrationFlowId: string, otp: string) => {
      try {
        const result = await dispatch(
          verifyPhoneThunk({ registrationFlowId, otp }),
        ).unwrap();
        toast.success(result.message || "Phone verified!");
        return result;
      } catch (err: any) {
        toast.error(err || "Phone verification failed");
        throw err;
      }
    },
    [dispatch],
  );

  /** Step 5 — POST .../finalize  → creates the account */
  const marketerStep4Finalize = useCallback(
    async (payload: {
      registrationFlowId: string;
      password: string;
      nickname: string;
    }) => {
      try {
        const result = await dispatch(marketerFinalize(payload)).unwrap();
        toast.success("Account created successfully!");
        return result;
      } catch (err: any) {
        toast.error(err || "Registration failed");
        throw err;
      }
    },
    [dispatch],
  );

  const clearMarketerFlow = useCallback(() => {
    dispatch(resetMarketerRegistration());
  }, [dispatch]);

  // ── Role / permission helpers ────────────────────────────────────────────────

  const hasRole = useCallback(
    (role: string) => !!user?.roles?.includes(role),
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => !!user?.permissions?.includes(permission),
    [user],
  );

  const isUserType = useCallback(
    (type: string) => user?.userType === type,
    [user],
  );

  const isAdmin = useCallback(
    () =>
      user?.userType === "SUPER_ADMIN" ||
      user?.userType === "ADMIN" ||
      user?.userType === "STAFF",
    [user],
  );

  const isVendor   = useCallback(() => user?.userType === "VENDOR",    [user]);
  const isMarketer = useCallback(() => user?.userType === "MARKETER",  [user]);

  const getFullName = useCallback(() => {
    if (!user) return "";
    const first = user.firstName?.trim() ?? "";
    const last  = user.lastName?.trim()  ?? "";
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    return user.email.split("@")[0] ?? user.email;
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    loading,
    initialLoading,
    error,
    sessions,
    marketerRegistration,
    passwordReset,
    userRole,

    // Core auth
    signin,
    signout,
    signoutAllDevices,
    verifyAuth,
    refreshToken,
    updateCurrentUser,
    clearError: clearAuthError,

    // Password
    requestPasswordReset,
    resetPasswordWithOTP,

    // Vendor activation
    activateVendorAccount,

    // Sessions
    loadSessions,
    removeSession,

    // Uniqueness check
    checkFieldUniqueness,

    // Marketer registration 
    marketerStep1InitEmail,      
    marketerStep2VerifyEmail,    
    marketerResendOTP,           
    marketerStep3InitPhone,      
    marketerTriggerPhoneOtp,     
    marketerResendPhoneOTP,      
    marketerVerifyPhone,         
    marketerStep4Finalize,       
    clearMarketerFlow,

    // Helpers
    hasRole,
    hasPermission,
    isUserType,
    isAdmin,
    isVendor,
    isMarketer,
    getFullName,
  };
}