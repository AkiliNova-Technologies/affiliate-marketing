// redux/slices/authSlice.ts
// Endpoints:
//   POST   /api/v1/auth/login
//   POST   /api/v1/auth/refresh
//   POST   /api/v1/auth/logout
//   POST   /api/v1/auth/logout-all
//   GET    /api/v1/auth/sessions
//   DELETE /api/v1/auth/sessions/{sessionId}
//   GET    /api/v1/auth/check
//   GET    /api/v1/auth/me
//   POST   /api/v1/auth/forgot-password
//   POST   /api/v1/auth/reset-password
//   POST   /api/v1/auth/activate-vendor
//   POST   /api/v1/auth/marketer-registration/init-email
//   POST   /api/v1/auth/marketer-registration/verify-email
//   POST   /api/v1/auth/marketer-registration/resend-email-otp
//   POST   /api/v1/auth/marketer-registration/init-phone
//   POST   /api/v1/auth/marketer-registration/finalize

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api, { saveAuthData, clearAuthData } from "@/utils/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "STAFF" | "VENDOR" | "MARKETER";

export interface User {
  id: string;
  userType: UserRole | string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  forcePasswordChange: boolean;
  permissions: string[];
  roles: string[];
  phoneNumber?: string;
  accountStatus?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthSession {
  id: string;
  deviceName?: string;
  ipAddress?: string;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface MarketerRegistrationState {
  step: "idle" | "email-sent" | "email-verified" | "phone-added" | "complete";
  email: string | null;
  registrationToken: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  sessions: {
    list: AuthSession[];
    loading: boolean;
    error: string | null;
  };
  marketerRegistration: MarketerRegistrationState;
  passwordReset: {
    pending: boolean;
    email: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialLoading: true,
  error: null,
  sessions: { list: [], loading: false, error: null },
  marketerRegistration: { step: "idle", email: null, registrationToken: null },
  passwordReset: { pending: false, email: null },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const handleApiError = (error: unknown): string => {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
        errors?: Array<{ field: string; message: string }>;
      };
    };
    message?: string;
  };
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.errors)
    return err.response.data.errors
      .map((e) => `${e.field}: ${e.message}`)
      .join(", ");
  return err.message || "An unexpected error occurred";
};

const mapApiResponseToUser = (data: any): User => ({
  id: data.userId?.toString() || data.id || "",
  userType: data.role || data.userType || "STAFF",
  email: data.email || "",
  firstName: data.firstName || "",
  lastName: data.lastName || "",
  isActive: data.isActive === true || data.emailVerified === true,
  emailVerified: data.emailVerified || false,
  forcePasswordChange: data.forcePasswordChange || false,
  permissions: data.permissions || [],
  roles: data.roles || [data.role || "STAFF"],
  phoneNumber: data.phoneNumber,
  accountStatus: data.accountStatus,
  avatarUrl: data.avatarUrl,
  createdAt: data.createdAt,
});

// ─── Thunks ────────────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login */
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/v1/auth/login", { email, password });
      return { user: mapApiResponseToUser(data), tokens: data.tokens };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/refresh */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/refresh", {});
      return { user: mapApiResponseToUser(data), tokens: data.tokens };
    } catch (err) {
      clearAuthData();
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/auth/me */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/auth/me");
      return { user: mapApiResponseToUser(data) };
    } catch (err) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 401) return rejectWithValue("Not authenticated");
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/logout */
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/v1/auth/logout", {});
      clearAuthData();
    } catch (err) {
      clearAuthData();
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/logout-all */
export const logoutAll = createAsyncThunk(
  "auth/logoutAll",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/v1/auth/logout-all", {});
      clearAuthData();
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/auth/sessions */
export const fetchSessions = createAsyncThunk(
  "auth/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/auth/sessions");
      return data as AuthSession[];
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** DELETE /api/v1/auth/sessions/{sessionId} */
export const revokeSession = createAsyncThunk(
  "auth/revokeSession",
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/auth/sessions/${sessionId}`);
      return sessionId;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/auth/check */
export const checkUniqueness = createAsyncThunk(
  "auth/checkUniqueness",
  async (
    params: { email?: string; phone?: string; nickname?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/auth/check", { params });
      return data as { available: boolean; field: string };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/forgot-password */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/forgot-password", { email });
      return { email, message: data.message || "Password reset OTP sent!" };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/reset-password */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, otp, newPassword }: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/v1/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return { message: data.message || "Password reset successfully!" };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/activate-vendor */
export const activateVendor = createAsyncThunk(
  "auth/activateVendor",
  async (
    payload: { emailOtp: string; phoneOtp: string; password: string; [key: string]: any },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/v1/auth/activate-vendor", payload);
      return { user: mapApiResponseToUser(data), tokens: data.tokens };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ─── Marketer Registration Thunks ─────────────────────────────────────────────

/** POST /api/v1/auth/marketer-registration/init-email */
export const marketerInitEmail = createAsyncThunk(
  "auth/marketerInitEmail",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/marketer-registration/init-email",
        { email }
      );
      return { email, message: data.message };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/marketer-registration/verify-email */
export const marketerVerifyEmail = createAsyncThunk(
  "auth/marketerVerifyEmail",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/marketer-registration/verify-email",
        { email, otp }
      );
      return { registrationToken: data.registrationToken, message: data.message };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/marketer-registration/resend-email-otp */
export const marketerResendEmailOtp = createAsyncThunk(
  "auth/marketerResendEmailOtp",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/marketer-registration/resend-email-otp",
        { email }
      );
      return { message: data.message };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/marketer-registration/init-phone */
export const marketerInitPhone = createAsyncThunk(
  "auth/marketerInitPhone",
  async ({ phoneNumber }: { phoneNumber: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/marketer-registration/init-phone",
        { phoneNumber }
      );
      return { message: data.message };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/auth/marketer-registration/finalize */
export const marketerFinalize = createAsyncThunk(
  "auth/marketerFinalize",
  async (
    payload: { password: string; firstName: string; lastName: string; [key: string]: any },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/marketer-registration/finalize",
        payload
      );
      return { user: mapApiResponseToUser(data), tokens: data.tokens };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.sessions = initialState.sessions;
      state.marketerRegistration = initialState.marketerRegistration;
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    loadUserFromStorage(state) {
      // redux-persist handles rehydration — this just marks initial load done
      state.initialLoading = false;
    },
    resetMarketerRegistration(state) {
      state.marketerRegistration = initialState.marketerRegistration;
    },
  },
  extraReducers: (builder) => {
    // ── login ──
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== "undefined" && payload.tokens) {
          saveAuthData({
            userId: payload.user.id,
            email: payload.user.email,
            role: payload.user.userType,
            emailVerified: payload.user.emailVerified,
            forcePasswordChange: payload.user.forcePasswordChange || false,
            tokens: payload.tokens,
          });
        }
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = payload as string;
        clearAuthData();
      });

    // ── refresh ──
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
        if (typeof window !== "undefined" && payload.tokens) {
          saveAuthData({
            userId: payload.user.id,
            email: payload.user.email,
            role: payload.user.userType,
            emailVerified: payload.user.emailVerified,
            forcePasswordChange: payload.user.forcePasswordChange || false,
            tokens: payload.tokens,
          });
        }
      })
      .addCase(refreshAccessToken.rejected, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = payload as string;
        clearAuthData();
      });

    // ── checkAuth ──
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.initialLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.initialLoading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, { payload }) => {
        state.loading = false;
        state.initialLoading = false;
        state.isAuthenticated = false;
        if (payload !== "Not authenticated") {
          state.error = payload as string;
        }
      });

    // ── logout ──
    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.sessions = initialState.sessions;
    });

    // ── logoutAll ──
    builder.addCase(logoutAll.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessions = initialState.sessions;
    });

    // ── sessions ──
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.sessions.loading = true;
        state.sessions.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, { payload }) => {
        state.sessions.loading = false;
        state.sessions.list = payload;
      })
      .addCase(fetchSessions.rejected, (state, { payload }) => {
        state.sessions.loading = false;
        state.sessions.error = payload as string;
      })
      .addCase(revokeSession.fulfilled, (state, { payload }) => {
        state.sessions.list = state.sessions.list.filter((s) => s.id !== payload);
      });

    // ── forgotPassword ──
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.passwordReset = { pending: true, email: payload.email };
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // ── resetPassword ──
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordReset = initialState.passwordReset;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // ── activateVendor ──
    builder
      .addCase(activateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateVendor.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
        if (typeof window !== "undefined" && payload.tokens) {
          saveAuthData({
            userId: payload.user.id,
            email: payload.user.email,
            role: payload.user.userType,
            emailVerified: payload.user.emailVerified,
            forcePasswordChange: payload.user.forcePasswordChange || false,
            tokens: payload.tokens,
          });
        }
      })
      .addCase(activateVendor.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // ── marketer registration (shared loading/error via matchers) ──
    builder
      .addCase(marketerInitEmail.fulfilled, (state, { payload }) => {
        state.marketerRegistration.step = "email-sent";
        state.marketerRegistration.email = payload.email;
      })
      .addCase(marketerVerifyEmail.fulfilled, (state, { payload }) => {
        state.marketerRegistration.step = "email-verified";
        state.marketerRegistration.registrationToken = payload.registrationToken;
      })
      .addCase(marketerInitPhone.fulfilled, (state) => {
        state.marketerRegistration.step = "phone-added";
      })
      .addCase(marketerFinalize.fulfilled, (state, { payload }) => {
        state.marketerRegistration.step = "complete";
        state.user = payload.user;
        state.isAuthenticated = true;
        if (typeof window !== "undefined" && payload.tokens) {
          saveAuthData({
            userId: payload.user.id,
            email: payload.user.email,
            role: payload.user.userType,
            emailVerified: payload.user.emailVerified,
            forcePasswordChange: payload.user.forcePasswordChange || false,
            tokens: payload.tokens,
          });
        }
      })
      .addMatcher(
        (a) => a.type.startsWith("auth/marketer") && a.type.endsWith("/pending"),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (a) => a.type.startsWith("auth/marketer") && a.type.endsWith("/rejected"),
        (state, action: any) => { state.loading = false; state.error = action.payload as string; }
      )
      .addMatcher(
        (a) => a.type.startsWith("auth/marketer") && a.type.endsWith("/fulfilled"),
        (state) => { state.loading = false; }
      );
  },
});

export const {
  logout,
  clearError,
  updateUser,
  loadUserFromStorage,
  resetMarketerRegistration,
} = authSlice.actions;

export default authSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentUser = (s: { auth: AuthState }) => s.auth.user;
export const selectIsAuthenticated = (s: { auth: AuthState }) => s.auth.isAuthenticated;
export const selectAuthLoading = (s: { auth: AuthState }) => s.auth.loading;
export const selectAuthError = (s: { auth: AuthState }) => s.auth.error;
export const selectInitialLoading = (s: { auth: AuthState }) => s.auth.initialLoading;
export const selectSessions = (s: { auth: AuthState }) => s.auth.sessions;
export const selectMarketerRegistration = (s: { auth: AuthState }) => s.auth.marketerRegistration;
export const selectPasswordReset = (s: { auth: AuthState }) => s.auth.passwordReset;
export const selectUserRole = (s: { auth: AuthState }) => s.auth.user?.userType;