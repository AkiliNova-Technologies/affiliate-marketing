// redux/slices/affiliateLinksSlice.ts
// Endpoints:
//   POST /api/v1/marketer/affiliate-links
//   GET  /api/v1/marketer/affiliate-links

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface AffiliateLink {
  id: string;
  productId: string;
  productName?: string;
  hopLink: string;
  createdAt: string;
  clickCount?: number;
  [key: string]: any;
}

export interface AffiliateLinksFilters {
  page?: number;
  limit?: number;
  productId?: string;
}

interface AffiliateLinksState {
  links: AffiliateLink[];
  total: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: AffiliateLinksState = {
  links: [],
  total: 0,
  loading: false,
  error: null,
  actionLoading: false,
};

/** POST /api/v1/marketer/affiliate-links */
export const generateAffiliateLink = createAsyncThunk(
  "affiliateLinks/generate",
  async (payload: { productId: string; [key: string]: any }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/marketer/affiliate-links", payload);
      return data as AffiliateLink;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/marketer/affiliate-links */
export const fetchAffiliateLinks = createAsyncThunk(
  "affiliateLinks/fetchAll",
  async (params: AffiliateLinksFilters = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/marketer/affiliate-links", { params });
      return {
        links: (data.data || data.links || data) as AffiliateLink[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const affiliateLinksSlice = createSlice({
  name: "affiliateLinks",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAffiliateLinks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAffiliateLinks.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.links = payload.links;
        state.total = payload.total;
      })
      .addCase(fetchAffiliateLinks.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(generateAffiliateLink.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(generateAffiliateLink.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.links.unshift(payload);
        state.total += 1;
      })
      .addCase(generateAffiliateLink.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearError } = affiliateLinksSlice.actions;
export default affiliateLinksSlice.reducer;

export const selectAffiliateLinks = (s: { affiliateLinks: AffiliateLinksState }) => s.affiliateLinks.links;
export const selectAffiliateLinksTotal = (s: { affiliateLinks: AffiliateLinksState }) => s.affiliateLinks.total;
export const selectAffiliateLinksLoading = (s: { affiliateLinks: AffiliateLinksState }) => s.affiliateLinks.loading;
export const selectAffiliateLinksError = (s: { affiliateLinks: AffiliateLinksState }) => s.affiliateLinks.error;
export const selectAffiliateLinksActionLoading = (s: { affiliateLinks: AffiliateLinksState }) => s.affiliateLinks.actionLoading;