// redux/slices/checkoutSlice.ts
// Endpoints:
//   POST /api/v1/checkout/intent
//   POST /api/v1/checkout/confirm
//   GET  /api/v1/checkout/intents/{intentId}/status
//   POST /api/v1/webhooks/stripe          (fire-and-forget; no state needed)
//   GET  /checkout                        (hosted page; navigation only)

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface CheckoutIntent {
  intentId: string;
  productId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "EXPIRED" | string;
  redirectUrl?: string;
  clientSecret?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface CheckoutIntentStatus {
  intentId: string;
  status: string;
  redirectUrl?: string;
  [key: string]: any;
}

export interface CreateIntentPayload {
  productId: string;
  hopSessionId?: string;
  affiliateLinkId?: string;
  [key: string]: any;
}

export interface ConfirmCheckoutPayload {
  intentId: string;
  paymentMethodId?: string;
  [key: string]: any;
}

interface CheckoutState {
  intent: CheckoutIntent | null;
  intentStatus: CheckoutIntentStatus | null;
  loading: boolean;
  confirmLoading: boolean;
  statusLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  intent: null,
  intentStatus: null,
  loading: false,
  confirmLoading: false,
  statusLoading: false,
  error: null,
};

/** POST /api/v1/checkout/intent */
export const createCheckoutIntent = createAsyncThunk(
  "checkout/createIntent",
  async (payload: CreateIntentPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/checkout/intent", payload);
      return data as CheckoutIntent;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/checkout/confirm */
export const confirmCheckout = createAsyncThunk(
  "checkout/confirm",
  async (payload: ConfirmCheckoutPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/checkout/confirm", payload);
      return data as { redirectUrl: string; [key: string]: any };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/checkout/intents/{intentId}/status */
export const fetchCheckoutIntentStatus = createAsyncThunk(
  "checkout/fetchIntentStatus",
  async (intentId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/api/v1/checkout/intents/${intentId}/status`
      );
      return data as CheckoutIntentStatus;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    clearCheckout(state) {
      state.intent = null;
      state.intentStatus = null;
      state.error = null;
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCheckoutIntent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCheckoutIntent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.intent = payload;
      })
      .addCase(createCheckoutIntent.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(confirmCheckout.pending, (state) => { state.confirmLoading = true; state.error = null; })
      .addCase(confirmCheckout.fulfilled, (state) => {
        state.confirmLoading = false;
      })
      .addCase(confirmCheckout.rejected, (state, { payload }) => {
        state.confirmLoading = false;
        state.error = payload as string;
      })

      .addCase(fetchCheckoutIntentStatus.pending, (state) => { state.statusLoading = true; state.error = null; })
      .addCase(fetchCheckoutIntentStatus.fulfilled, (state, { payload }) => {
        state.statusLoading = false;
        state.intentStatus = payload;
        // Keep intent status in sync
        if (state.intent?.intentId === payload.intentId) {
          state.intent = { ...state.intent, status: payload.status };
        }
      })
      .addCase(fetchCheckoutIntentStatus.rejected, (state, { payload }) => {
        state.statusLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearCheckout, clearError } = checkoutSlice.actions;
export default checkoutSlice.reducer;

export const selectCheckoutIntent = (s: { checkout: CheckoutState }) => s.checkout.intent;
export const selectCheckoutIntentStatus = (s: { checkout: CheckoutState }) => s.checkout.intentStatus;
export const selectCheckoutLoading = (s: { checkout: CheckoutState }) => s.checkout.loading;
export const selectCheckoutConfirmLoading = (s: { checkout: CheckoutState }) => s.checkout.confirmLoading;
export const selectCheckoutStatusLoading = (s: { checkout: CheckoutState }) => s.checkout.statusLoading;
export const selectCheckoutError = (s: { checkout: CheckoutState }) => s.checkout.error;