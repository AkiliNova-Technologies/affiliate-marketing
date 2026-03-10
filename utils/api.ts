import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  "https://affiliate-marketing-system-backend-production.up.railway.app";

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
  withCredentials: false,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

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

// Check if token is expired or about to expire
const isTokenExpired = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const buffer = bufferMinutes * 60 * 1000;
    return now >= expiry - buffer;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true; // Assume expired if parsing fails
  }
};

// Save auth data after login (only user data, token stays in memory)
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

// **FIXED:** This function no longer attempts to read an access token from storage.
// Instead, it should be used to trigger a silent refresh on app startup.
// Call `attemptSilentRefresh()` (defined below) instead.
export const restoreAccessToken = () => {
  // Deprecated – kept for compatibility. Use `attemptSilentRefresh()`.
  console.warn("restoreAccessToken is deprecated. Use attemptSilentRefresh() instead.");
};

// Attempt to refresh the token silently using the http‑only cookie.
// Call this once when your app initialises.
export const attemptSilentRefresh = async (): Promise<boolean> => {
  try {
    await refreshBackendToken();
    return true;
  } catch {
    return false;
  }
};

// Refresh token endpoint call – expects the cookie to be sent automatically
const refreshBackendToken = async (): Promise<string> => {
  const response = await refreshApi.post("/api/v1/auth/refresh");

  const { accessToken, expiresInSec } = response.data.tokens;

  const authDataStr = localStorage.getItem("authData");
  if (authDataStr) {
    const authData: AuthData = JSON.parse(authDataStr);
    authData.tokenExpiry = Date.now() + expiresInSec * 1000;
    localStorage.setItem("authData", JSON.stringify(authData));
  }

  setAccessToken(accessToken);
  return accessToken;
};

// Request interceptor: attach token if available
api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with improved error logging and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // **Improved logging:** guard against missing error.config
    console.error("❌ API error:", {
      url: error.config?.url ?? "N/A",
      method: error.config?.method ?? "N/A",
      status: error.response?.status ?? "NO_RESPONSE",
      data: error.response?.data ?? null,
      message: error.message,
    });

    // Handle 401 Unauthorized – token might be expired
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request while a refresh is already in progress
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

        // Clear auth data
        clearAuthData();

        // Dispatch logout event so the UI can react
        window.dispatchEvent(new CustomEvent("auth:logout"));

        // Reject with a user‑friendly message
        return Promise.reject(
          new Error("Session expired. Please login again."),
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors (no response) with retry
    if (!error.response) {
      console.error("Network error - no response received");

      // Only retry if we haven't already and haven't exceeded max retries
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        if (originalRequest._retryCount <= 3) {
          const retryDelay = originalRequest._retryCount * 1000;
          console.log(`Retrying request (${originalRequest._retryCount}/3) in ${retryDelay}ms...`);

          return new Promise((resolve) => {
            setTimeout(
              () => resolve(api(originalRequest)),
              Math.min(retryDelay, 5000),
            );
          });
        } else {
          console.error("Max retries reached for network error. Giving up.");
        }
      }
    }

    return Promise.reject(error);
  },
);

// Token refresh scheduler
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

// Start proactive token refresh (checks every 4 minutes)
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
        console.log("🔄 Token expiring soon, refreshing proactively...");
        await refreshBackendToken();
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  };

  // Check immediately
  checkAndRefreshToken();

  // Then every 4 minutes
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

// Manual token refresh (useful for user‑triggered refresh)
export const manualTokenRefresh = async (): Promise<boolean> => {
  try {
    await refreshBackendToken();
    return true;
  } catch (error) {
    console.error("Manual token refresh failed:", error);
    return false;
  }
};

// Check if the current session is valid (token exists and not expired)
export const checkAuthSession = (): boolean => {
  if (typeof window === "undefined") return false;

  const token = getAccessToken();
  if (!token) {
    // No in‑memory token – we might still have a refresh cookie
    return true; // optimistic – let the app attempt a refresh
  }

  if (isTokenExpired(token, 0)) {
    console.log("❌ Access token expired");
    return false;
  }

  return true;
};

// Clear all authentication data (logout)
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  stopTokenRefreshScheduler();

  setAccessToken(null);
  localStorage.removeItem("authData");
  localStorage.removeItem("user"); // if you also store user separately

  console.log("✅ Auth data cleared");
};

export default api;