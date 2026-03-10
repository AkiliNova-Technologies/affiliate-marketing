// redux/slices/adminSchedulerSlice.ts
// Endpoints:
//   GET  /api/v1/admin/schedulers/suspended-account-deactivation
//   POST /api/v1/admin/schedulers/suspended-account-deactivation/run

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface SchedulerStatus {
  name: string;
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  status: string;
  [key: string]: any;
}

interface AdminSchedulerState {
  suspendedAccountDeactivation: SchedulerStatus | null;
  loading: boolean;
  runLoading: boolean;
  error: string | null;
}

const initialState: AdminSchedulerState = {
  suspendedAccountDeactivation: null,
  loading: false,
  runLoading: false,
  error: null,
};

/** GET /api/v1/admin/schedulers/suspended-account-deactivation */
export const fetchSchedulerStatus = createAsyncThunk(
  "adminScheduler/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        "/api/v1/admin/schedulers/suspended-account-deactivation"
      );
      return data as SchedulerStatus;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/admin/schedulers/suspended-account-deactivation/run */
export const runScheduler = createAsyncThunk(
  "adminScheduler/run",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/v1/admin/schedulers/suspended-account-deactivation/run",
        {}
      );
      return data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const adminSchedulerSlice = createSlice({
  name: "adminScheduler",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedulerStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSchedulerStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.suspendedAccountDeactivation = payload;
      })
      .addCase(fetchSchedulerStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(runScheduler.pending, (state) => { state.runLoading = true; state.error = null; })
      .addCase(runScheduler.fulfilled, (state) => { state.runLoading = false; })
      .addCase(runScheduler.rejected, (state, { payload }) => {
        state.runLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearError } = adminSchedulerSlice.actions;
export default adminSchedulerSlice.reducer;

export const selectSchedulerStatus = (s: { adminScheduler: AdminSchedulerState }) => s.adminScheduler.suspendedAccountDeactivation;
export const selectSchedulerLoading = (s: { adminScheduler: AdminSchedulerState }) => s.adminScheduler.loading;
export const selectSchedulerRunLoading = (s: { adminScheduler: AdminSchedulerState }) => s.adminScheduler.runLoading;
export const selectSchedulerError = (s: { adminScheduler: AdminSchedulerState }) => s.adminScheduler.error;