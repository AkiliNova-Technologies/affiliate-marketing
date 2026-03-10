// redux/slices/adminProductsSlice.ts
// Endpoints:
//   GET   /api/v1/admin/products/queue
//   GET   /api/v1/admin/product/{id}
//   PATCH /api/v1/admin/product/approve/{id}
//   PATCH /api/v1/admin/products/{id}/reject
//   PATCH /api/v1/admin/products/{id}/suspend
//   PATCH /api/v1/admin/products/{id}/reactivate

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  vendorId: string;
  vendorName?: string;
  status:
    | "PENDING_APPROVAL"
    | "PENDING_REAPPROVAL"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED"
    | "DELETED"
    | "DEACTIVATED";
  categoryId?: string;
  categoryName?: string;
  price?: number;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
  [key: string]: any;
}

interface AdminProductsState {
  queue: AdminProduct[];
  selectedProduct: AdminProduct | null;
  total: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: AdminProductsState = {
  queue: [],
  selectedProduct: null,
  total: 0,
  loading: false,
  error: null,
  actionLoading: false,
};

/** GET /api/v1/admin/products/queue */
export const fetchAdminProductQueue = createAsyncThunk(
  "adminProducts/fetchQueue",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/admin/products/queue", { params });
      return {
        products: (data.data || data.products || data) as AdminProduct[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/admin/product/{id} */
export const fetchAdminProductById = createAsyncThunk(
  "adminProducts/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/admin/product/${id}`);
      return data as AdminProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/admin/product/approve/{id} */
export const approveProduct = createAsyncThunk(
  "adminProducts/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/product/approve/${id}`, {});
      return data as AdminProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/admin/products/{id}/reject */
export const rejectProduct = createAsyncThunk(
  "adminProducts/reject",
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/products/${id}/reject`, { reason });
      return data as AdminProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/admin/products/{id}/suspend */
export const suspendProduct = createAsyncThunk(
  "adminProducts/suspend",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/products/${id}/suspend`, { reason });
      return data as AdminProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/admin/products/{id}/reactivate */
export const reactivateProduct = createAsyncThunk(
  "adminProducts/reactivate",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/products/${id}/reactivate`, {});
      return data as AdminProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ─── Helper ────────────────────────────────────────────────────────────────────

const syncProduct = (queue: AdminProduct[], updated: AdminProduct) => {
  const idx = queue.findIndex((p) => p.id === updated.id);
  if (idx !== -1) queue[idx] = updated;
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearSelectedProduct(state) { state.selectedProduct = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProductQueue.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminProductQueue.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.queue = payload.products;
        state.total = payload.total;
      })
      .addCase(fetchAdminProductQueue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchAdminProductById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminProductById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedProduct = payload;
      })
      .addCase(fetchAdminProductById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });

    // All action thunks share the same loading/sync pattern
    const actionThunks = [approveProduct, rejectProduct, suspendProduct, reactivateProduct];
    actionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.actionLoading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, { payload }) => {
          state.actionLoading = false;
          syncProduct(state.queue, payload as AdminProduct);
          if (state.selectedProduct?.id === (payload as AdminProduct).id) {
            state.selectedProduct = payload as AdminProduct;
          }
        })
        .addCase(thunk.rejected, (state, { payload }) => {
          state.actionLoading = false;
          state.error = payload as string;
        });
    });
  },
});

export const { clearSelectedProduct, clearError } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;

export const selectAdminProductQueue = (s: { adminProducts: AdminProductsState }) => s.adminProducts.queue;
export const selectSelectedAdminProduct = (s: { adminProducts: AdminProductsState }) => s.adminProducts.selectedProduct;
export const selectAdminProductsLoading = (s: { adminProducts: AdminProductsState }) => s.adminProducts.loading;
export const selectAdminProductsError = (s: { adminProducts: AdminProductsState }) => s.adminProducts.error;
export const selectAdminProductsTotal = (s: { adminProducts: AdminProductsState }) => s.adminProducts.total;
export const selectAdminProductsActionLoading = (s: { adminProducts: AdminProductsState }) => s.adminProducts.actionLoading;