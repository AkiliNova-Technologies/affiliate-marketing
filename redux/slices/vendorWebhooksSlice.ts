// redux/slices/vendorWebhooksSlice.ts
// Endpoints:
//   POST /api/v1/vendor/webhooks/test
//   GET  /api/v1/vendor/webhooks/deliveries
//   POST /api/v1/public/vendor-webhook-consumer        (local test; no Redux state needed — util only)
//   GET  /api/v1/public/vendor-webhook-consumer/events (local test consumer events)

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface WebhookDelivery {
  id: string;
  eventType: string;
  url: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | string;
  responseCode?: number;
  attempt?: number;
  createdAt: string;
  [key: string]: any;
}

export interface WebhookConsumerEvent {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  receivedAt: string;
  signatureValid: boolean;
  [key: string]: any;
}

interface VendorWebhooksState {
  deliveries: WebhookDelivery[];
  deliveriesTotal: number;
  consumerEvents: WebhookConsumerEvent[];
  loading: boolean;
  testLoading: boolean;
  consumerLoading: boolean;
  error: string | null;
}

const initialState: VendorWebhooksState = {
  deliveries: [],
  deliveriesTotal: 0,
  consumerEvents: [],
  loading: false,
  testLoading: false,
  consumerLoading: false,
  error: null,
};

/** POST /api/v1/vendor/webhooks/test */
export const triggerTestWebhook = createAsyncThunk(
  "vendorWebhooks/test",
  async (
    payload: { productId?: string; [key: string]: any } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/v1/vendor/webhooks/test", payload);
      return data as { message: string; [key: string]: any };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/vendor/webhooks/deliveries */
export const fetchWebhookDeliveries = createAsyncThunk(
  "vendorWebhooks/fetchDeliveries",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/vendor/webhooks/deliveries", { params });
      return {
        deliveries: (data.data || data.deliveries || data) as WebhookDelivery[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/public/vendor-webhook-consumer/events  (local dev test consumer) */
export const fetchConsumerEvents = createAsyncThunk(
  "vendorWebhooks/fetchConsumerEvents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/api/v1/public/vendor-webhook-consumer/events"
      );
      return (data.data || data.events || data) as WebhookConsumerEvent[];
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const vendorWebhooksSlice = createSlice({
  name: "vendorWebhooks",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    clearConsumerEvents(state) { state.consumerEvents = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerTestWebhook.pending, (state) => { state.testLoading = true; state.error = null; })
      .addCase(triggerTestWebhook.fulfilled, (state) => { state.testLoading = false; })
      .addCase(triggerTestWebhook.rejected, (state, { payload }) => {
        state.testLoading = false;
        state.error = payload as string;
      })

      .addCase(fetchWebhookDeliveries.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWebhookDeliveries.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.deliveries = payload.deliveries;
        state.deliveriesTotal = payload.total;
      })
      .addCase(fetchWebhookDeliveries.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchConsumerEvents.pending, (state) => { state.consumerLoading = true; state.error = null; })
      .addCase(fetchConsumerEvents.fulfilled, (state, { payload }) => {
        state.consumerLoading = false;
        state.consumerEvents = payload;
      })
      .addCase(fetchConsumerEvents.rejected, (state, { payload }) => {
        state.consumerLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearError, clearConsumerEvents } = vendorWebhooksSlice.actions;
export default vendorWebhooksSlice.reducer;

export const selectWebhookDeliveries = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.deliveries;
export const selectWebhookDeliveriesTotal = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.deliveriesTotal;
export const selectWebhookDeliveriesLoading = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.loading;
export const selectWebhookTestLoading = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.testLoading;
export const selectConsumerEvents = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.consumerEvents;
export const selectConsumerEventsLoading = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.consumerLoading;
export const selectVendorWebhooksError = (s: { vendorWebhooks: VendorWebhooksState }) => s.vendorWebhooks.error;