// redux/slices/campaignsSlice.ts
// Endpoints:
//   POST   /api/v1/marketer/campaigns
//   GET    /api/v1/marketer/campaigns
//   GET    /api/v1/marketer/campaigns/{id}
//   DELETE /api/v1/marketer/campaigns/{id}
//   PATCH  /api/v1/marketer/campaigns/{id}/status

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface Campaign {
  id: string;
  productId: string;
  productName?: string;
  hopLink?: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | string;
  createdAt: string;
  updatedAt?: string;
  lastActionAt?: string;
  clickCount?: number;
  conversionCount?: number;
  [key: string]: any;
}

export interface CreateCampaignPayload {
  productId: string;
  [key: string]: any;
}

interface CampaignsState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  total: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: CampaignsState = {
  campaigns: [],
  selectedCampaign: null,
  total: 0,
  loading: false,
  error: null,
  actionLoading: false,
};

/** POST /api/v1/marketer/campaigns */
export const createCampaign = createAsyncThunk(
  "campaigns/create",
  async (payload: CreateCampaignPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/marketer/campaigns", payload);
      return data as Campaign;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/marketer/campaigns */
export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/marketer/campaigns", { params });
      return {
        campaigns: (data.data || data.campaigns || data) as Campaign[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/marketer/campaigns/{id} */
export const fetchCampaignById = createAsyncThunk(
  "campaigns/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/marketer/campaigns/${id}`);
      return data as Campaign;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** DELETE /api/v1/marketer/campaigns/{id} */
export const deleteCampaign = createAsyncThunk(
  "campaigns/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/marketer/campaigns/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/marketer/campaigns/{id}/status */
export const updateCampaignStatus = createAsyncThunk(
  "campaigns/updateStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(
        `/api/v1/marketer/campaigns/${id}/status`,
        { status }
      );
      return data as Campaign;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ─── Helper ────────────────────────────────────────────────────────────────────

const syncCampaign = (campaigns: Campaign[], updated: Campaign) => {
  const idx = campaigns.findIndex((c) => c.id === updated.id);
  if (idx !== -1) campaigns[idx] = updated;
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    clearSelectedCampaign(state) { state.selectedCampaign = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCampaigns.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.campaigns = payload.campaigns;
        state.total = payload.total;
      })
      .addCase(fetchCampaigns.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchCampaignById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCampaignById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedCampaign = payload;
      })
      .addCase(fetchCampaignById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(createCampaign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createCampaign.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.campaigns.unshift(payload);
        state.total += 1;
      })
      .addCase(createCampaign.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(deleteCampaign.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(deleteCampaign.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        // Soft delete — keep in list but mark status DELETED if present,
        // or remove entirely; here we remove to keep UI clean.
        state.campaigns = state.campaigns.filter((c) => c.id !== payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCampaign.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(updateCampaignStatus.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateCampaignStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        syncCampaign(state.campaigns, payload);
        if (state.selectedCampaign?.id === payload.id) state.selectedCampaign = payload;
      })
      .addCase(updateCampaignStatus.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearSelectedCampaign, clearError } = campaignsSlice.actions;
export default campaignsSlice.reducer;

export const selectCampaigns = (s: { campaigns: CampaignsState }) => s.campaigns.campaigns;
export const selectSelectedCampaign = (s: { campaigns: CampaignsState }) => s.campaigns.selectedCampaign;
export const selectCampaignsTotal = (s: { campaigns: CampaignsState }) => s.campaigns.total;
export const selectCampaignsLoading = (s: { campaigns: CampaignsState }) => s.campaigns.loading;
export const selectCampaignsError = (s: { campaigns: CampaignsState }) => s.campaigns.error;
export const selectCampaignsActionLoading = (s: { campaigns: CampaignsState }) => s.campaigns.actionLoading;