// redux/slices/marketplaceSlice.ts
// Endpoint: GET /api/v1/marketplace/products

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface MarketplaceProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
  vendorId?: string;
  vendorName?: string;
  images?: string[];
  status: string;
  createdAt: string;
  [key: string]: any;
}

export interface MarketplaceFilters {
  category?: string;
  vendor?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface MarketplaceState {
  products: MarketplaceProduct[];
  total: number;
  page: number;
  filters: MarketplaceFilters;
  loading: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  products: [],
  total: 0,
  page: 1,
  filters: {},
  loading: false,
  error: null,
};

/** GET /api/v1/marketplace/products */
export const fetchMarketplaceProducts = createAsyncThunk(
  "marketplace/fetchProducts",
  async (params: MarketplaceFilters = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/marketplace/products", { params });
      return {
        products: (data.data || data.products || data) as MarketplaceProduct[],
        total: data.total || data.count || 0,
        page: params.page || 1,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<MarketplaceFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketplaceProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMarketplaceProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload.products;
        state.total = payload.total;
        state.page = payload.page;
      })
      .addCase(fetchMarketplaceProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError: clearMarketplaceError } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;

export const selectMarketplaceProducts = (s: { marketplace: MarketplaceState }) => s.marketplace.products;
export const selectMarketplaceLoading = (s: { marketplace: MarketplaceState }) => s.marketplace.loading;
export const selectMarketplaceTotal = (s: { marketplace: MarketplaceState }) => s.marketplace.total;
export const selectMarketplacePage = (s: { marketplace: MarketplaceState }) => s.marketplace.page;
export const selectMarketplaceFilters = (s: { marketplace: MarketplaceState }) => s.marketplace.filters;