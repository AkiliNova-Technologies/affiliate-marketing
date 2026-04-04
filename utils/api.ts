import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = "https://affiliate-marketing-system-backend-production.up.railway.app";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ← MUST be true so the refresh cookie is sent automatically
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ← same here — the refresh token lives in an httpOnly cookie
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthData {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokenExpiry: number;
}

interface AuthState {
  hasToken: boolean;
  accessToken: string | null;
  user: any;
  tokenExpiry?: number;
  userId?: string;
  email?: string;
  role?: string;
  emailVerified?: boolean;
}

// ─── In-memory access token ───────────────────────────────────────────────────

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

// ─── Auth state ───────────────────────────────────────────────────────────────

export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { hasToken: false, accessToken: null, user: null };
  }

  try {
    const authDataStr = localStorage.getItem("authData");
    if (!authDataStr) {
      return { hasToken: false, accessToken: null, user: null };
    }

    const parsedData: AuthData = JSON.parse(authDataStr);

    return {
      hasToken: !!inMemoryAccessToken,
      accessToken: inMemoryAccessToken,
      tokenExpiry: parsedData.tokenExpiry,
      userId: parsedData.userId,
      email: parsedData.email,
      role: parsedData.role,
      emailVerified: parsedData.emailVerified,
      user: parsedData,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    return { hasToken: false, accessToken: null, user: null };
  }
};

// ─── Token expiry check ───────────────────────────────────────────────────────

const isTokenExpired = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    const buffer = bufferMinutes * 60 * 1000;
    return now >= expiry - buffer;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
};

// ─── Save auth data after login ───────────────────────────────────────────────
//
// Login response shape:
//   { accessToken, expiresIn, tokenType, user: { id, role, email, ... } }
//
export const saveAuthData = (loginResponse: {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
  forcePasswordChange?: boolean;
  tokens: {
    accessToken: string;
    expiresInSec: number;
  };
}) => {
  if (typeof window === "undefined") return;

  const authData: AuthData = {
    userId: loginResponse.userId,
    email: loginResponse.email,
    role: loginResponse.role,
    emailVerified: loginResponse.emailVerified,
    forcePasswordChange: loginResponse.forcePasswordChange,
    tokenExpiry: Date.now() + loginResponse.tokens.expiresInSec * 1000,
  };

  localStorage.setItem("authData", JSON.stringify(authData));
  setAccessToken(loginResponse.tokens.accessToken);
};

// ─── Save after a token refresh ───────────────────────────────────────────────
//
// Refresh response shape (same flat shape as login):
//   { accessToken, expiresIn, tokenType }
//
const saveRefreshData = (accessToken: string, expiresIn: number) => {
  if (typeof window === "undefined") return;

  try {
    const authDataStr = localStorage.getItem("authData");
    if (authDataStr) {
      const authData: AuthData = JSON.parse(authDataStr);
      authData.tokenExpiry = Date.now() + expiresIn * 1000;
      localStorage.setItem("authData", JSON.stringify(authData));
    }
  } catch {
    // localStorage unavailable or corrupt — not fatal
  }

  setAccessToken(accessToken);
};

// ─── Core refresh call ────────────────────────────────────────────────────────
//
// Uses refreshApi (separate axios instance) so the response interceptor on the
// main `api` instance never intercepts this call and causes an infinite loop.
//
const refreshBackendToken = async (): Promise<string> => {
  // The refresh token is an httpOnly cookie sent automatically by the browser
  // because withCredentials: true is set on refreshApi.
  const response = await refreshApi.post("/api/v1/auth/refresh");
  const data = response.data;

  // ── Validate response ───────────────────────────────────────────────────────
  // Guard against the backend returning a 200 with an error body
  // e.g. { code: "AUTH_REFRESH_REUSED", message: "..." }
  if (!data.accessToken || data.code?.startsWith("AUTH_")) {
    const msg = data.message || "Refresh token invalid or reused";
    console.error("❌ Refresh rejected by server:", msg);
    throw new Error(msg);
  }

  // Flat shape: { accessToken, expiresIn, tokenType }
  saveRefreshData(data.accessToken, data.expiresIn);
  return data.accessToken;
};

// ─── Public: silent refresh on app init ──────────────────────────────────────

export const attemptSilentRefresh = async (): Promise<boolean> => {
  try {
    await refreshBackendToken();
    return true;
  } catch (err) {
    console.warn("Silent refresh failed:", err);
    return false;
  }
};

// Deprecated — kept for import compatibility
export const restoreAccessToken = () => {
  console.warn("restoreAccessToken is deprecated. Use attemptSilentRefresh() instead.");
};

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 and network errors ────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Log all API errors (but don't log missing config — can happen on network drop)
    if (error.config) {
      console.error("❌ API error:", {
        url: error.config.url ?? "N/A",
        method: error.config.method ?? "N/A",
        status: error.response?.status ?? "NO_RESPONSE",
        data: error.response?.data ?? null,
        message: error.message,
      });
    }

    // ── 401 handler: try to refresh once, then retry original request ──────────
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      // If a refresh is already in-flight, queue this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshBackendToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed, clearing auth:", refreshError);
        processQueue(refreshError, null);
        clearAuthData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        return Promise.reject(new Error("Session expired. Please login again."));
      } finally {
        isRefreshing = false;
      }
    }

    // ── Network error: retry up to 3 times with back-off ──────────────────────
    if (!error.response) {
      console.error("Network error - no response received");

      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;

        if (originalRequest._retryCount <= 3) {
          const delay = Math.min(originalRequest._retryCount * 1000, 5000);
          console.log(`Retrying (${originalRequest._retryCount}/3) in ${delay}ms…`);
          return new Promise((resolve) =>
            setTimeout(() => resolve(api(originalRequest)), delay)
          );
        } else {
          console.error("Max retries reached. Giving up.");
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Proactive token refresh scheduler ───────────────────────────────────────

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export const startTokenRefreshScheduler = (): (() => void) | null => {
  if (schedulerInterval) {
    console.log("⚠️ Token refresh scheduler already running");
    return () => stopTokenRefreshScheduler();
  }

  if (typeof window === "undefined") {
    console.log("⚠️ Window not defined, cannot start scheduler");
    return null;
  }

  const checkAndRefreshToken = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      if (isTokenExpired(token, 5)) {
        console.log("🔄 Token expiring soon, refreshing proactively…");
        await refreshBackendToken();
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  };

  checkAndRefreshToken();
  schedulerInterval = setInterval(checkAndRefreshToken, 4 * 60 * 1000);
  console.log("✅ Token refresh scheduler started");

  return () => stopTokenRefreshScheduler();
};

export const stopTokenRefreshScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("🛑 Token refresh scheduler stopped");
  }
};

// ─── Manual refresh (user-triggered) ─────────────────────────────────────────

export const manualTokenRefresh = async (): Promise<boolean> => {
  try {
    await refreshBackendToken();
    return true;
  } catch (error) {
    console.error("Manual token refresh failed:", error);
    return false;
  }
};

// ─── Session validity check ───────────────────────────────────────────────────

export const checkAuthSession = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = getAccessToken();
  if (!token) return true; // optimistic — may still have a valid refresh cookie

  if (isTokenExpired(token, 0)) {
    console.log("❌ Access token expired");
    return false;
  }

  return true;
};

// ─── Clear all auth data (logout) ────────────────────────────────────────────

export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  stopTokenRefreshScheduler();
  setAccessToken(null);
  localStorage.removeItem("authData");
  localStorage.removeItem("user");
  console.log("✅ Auth data cleared");
};

export default api;