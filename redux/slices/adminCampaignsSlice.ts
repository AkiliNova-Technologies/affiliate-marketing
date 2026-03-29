// redux/slices/adminCampaignsSlice.ts
// Endpoints:
//   GET /api/v1/admin/campaigns
//   GET /api/v1/admin/marketers/{id}/campaigns

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface AdminCampaign {
  id: string;
  status: string;

  marketerId?: string;
  marketerName?: string;

  productId?: string;
  productName?: string;

  vendorId?: string;
  vendorName?: string;

  totalClicks: number;
  totalSales: number;
  conversionRate: number;

  createdAt: string;
  lastActionAt?: string;
}

export interface MarketerCampaignDetail extends AdminCampaign {
  dynamicHopLink?: string;
}

interface AdminCampaignsState {
  campaigns: AdminCampaign[];
  marketerCampaigns: MarketerCampaignDetail[];
  total: number;
  marketerTotal: number;
  loading: boolean;
  marketerLoading: boolean;
  error: string | null;
}

const initialState: AdminCampaignsState = {
  campaigns: [],
  marketerCampaigns: [],
  total: 0,
  marketerTotal: 0,
  loading: false,
  marketerLoading: false,
  error: null,
};

/** GET /api/v1/admin/campaigns */
export const fetchAdminCampaigns = createAsyncThunk(
  "adminCampaigns/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      marketerId?: string;
      productId?: string;
      vendorId?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get("/api/v1/admin/campaigns", { params });
      return {
        campaigns: (data.data || data.campaigns || data) as AdminCampaign[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** GET /api/v1/admin/marketers/{id}/campaigns */
export const fetchMarketerCampaigns = createAsyncThunk(
  "adminCampaigns/fetchByMarketer",
  async (
    {
      id,
      params = {},
    }: { id: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/api/v1/admin/marketers/${id}/campaigns`,
        { params },
      );
      return {
        campaigns: (data.data ||
          data.campaigns ||
          data) as MarketerCampaignDetail[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

const adminCampaignsSlice = createSlice({
  name: "adminCampaigns",
  initialState,
  reducers: {
    clearMarketerCampaigns(state) {
      state.marketerCampaigns = [];
      state.marketerTotal = 0;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCampaigns.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.campaigns = payload.campaigns;
        state.total = payload.total;
      })
      .addCase(fetchAdminCampaigns.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchMarketerCampaigns.pending, (state) => {
        state.marketerLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketerCampaigns.fulfilled, (state, { payload }) => {
        state.marketerLoading = false;
        state.marketerCampaigns = payload.campaigns;
        state.marketerTotal = payload.total;
      })
      .addCase(fetchMarketerCampaigns.rejected, (state, { payload }) => {
        state.marketerLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearMarketerCampaigns, clearError } =
  adminCampaignsSlice.actions;
export default adminCampaignsSlice.reducer;

export const selectAdminCampaigns = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.campaigns;
export const selectCampaignStats = (state: {
  adminCampaigns: AdminCampaignsState;
}) => {
  const campaigns = state.adminCampaigns.campaigns;

  return {
    total: campaigns.length,
    active: campaigns.filter((c: AdminCampaign) => c.status === "ACTIVE")
      .length,
    suspended: campaigns.filter((c: AdminCampaign) => c.status === "SUSPENDED")
      .length,
    revenue: campaigns.reduce(
      (acc: number, c: AdminCampaign) => acc + (c.totalSales || 0),
      0,
    ),
  };
};
export const selectAdminCampaignsTotal = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.total;
export const selectAdminCampaignsLoading = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.loading;
export const selectMarketerCampaigns = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.marketerCampaigns;
export const selectMarketerCampaignsTotal = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.marketerTotal;
export const selectMarketerCampaignsLoading = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.marketerLoading;
export const selectAdminCampaignsError = (s: {
  adminCampaigns: AdminCampaignsState;
}) => s.adminCampaigns.error;
