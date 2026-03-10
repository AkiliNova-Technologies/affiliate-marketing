// redux/slices/adminMarketersSlice.ts
// Endpoints:
//   GET /api/v1/marketers
//   GET /api/v1/marketers/{id}

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface Marketer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  createdAt: string;
  campaignsCount?: number;
  [key: string]: any;
}

interface AdminMarketersState {
  marketers: Marketer[];
  selectedMarketer: Marketer | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: AdminMarketersState = {
  marketers: [],
  selectedMarketer: null,
  total: 0,
  loading: false,
  error: null,
};

/** GET /api/v1/marketers */
export const fetchMarketers = createAsyncThunk(
  "adminMarketers/fetchAll",
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/marketers", { params });
      return {
        marketers: (data.data || data.marketers || data) as Marketer[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/marketers/{id} */
export const fetchMarketerById = createAsyncThunk(
  "adminMarketers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/marketers/${id}`);
      return data as Marketer;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const adminMarketersSlice = createSlice({
  name: "adminMarketers",
  initialState,
  reducers: {
    clearSelectedMarketer(state) { state.selectedMarketer = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMarketers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.marketers = payload.marketers;
        state.total = payload.total;
      })
      .addCase(fetchMarketers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchMarketerById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMarketerById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedMarketer = payload;
      })
      .addCase(fetchMarketerById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { clearSelectedMarketer, clearError } = adminMarketersSlice.actions;
export default adminMarketersSlice.reducer;

export const selectMarketers = (s: { adminMarketers: AdminMarketersState }) => s.adminMarketers.marketers;
export const selectSelectedMarketer = (s: { adminMarketers: AdminMarketersState }) => s.adminMarketers.selectedMarketer;
export const selectMarketersLoading = (s: { adminMarketers: AdminMarketersState }) => s.adminMarketers.loading;
export const selectMarketersError = (s: { adminMarketers: AdminMarketersState }) => s.adminMarketers.error;
export const selectMarketersTotal = (s: { adminMarketers: AdminMarketersState }) => s.adminMarketers.total;