// redux/slices/vendorProductsSlice.ts
// Endpoints:
//   POST  /api/v1/product/create
//   PATCH /api/v1/product/update
//   PATCH /api/v1/product/delete
//   PATCH /api/v1/product/{id}/deactivate
//   PATCH /api/v1/product/{id}/reinstate
//   GET   /api/v1/vendor/products/my-inventory
//   GET   /api/v1/vender/products/my-inventory  (alternate typo endpoint)
//   GET   /api/v1/vendor/product/{id}
//   PATCH /api/v1/vendor/delete/product/{id}

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface VendorProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "ACTIVE"
    | "SUSPENDED"
    | "DEACTIVATED"
    | "DELETED"
    | "PENDING_REAPPROVAL";
  categoryId?: string;
  categoryName?: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

interface VendorProductsState {
  inventory: VendorProduct[];
  selectedProduct: VendorProduct | null;
  total: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: VendorProductsState = {
  inventory: [],
  selectedProduct: null,
  total: 0,
  loading: false,
  error: null,
  actionLoading: false,
};

/** GET /api/v1/vendor/products/my-inventory */
export const fetchVendorInventory = createAsyncThunk(
  "vendorProducts/fetchInventory",
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/v1/vendor/products/my-inventory", { params });
      return {
        products: (data.data || data.products || data) as VendorProduct[],
        total: data.total || data.count || 0,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/vendor/product/{id} */
export const fetchVendorProductById = createAsyncThunk(
  "vendorProducts/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/vendor/product/${id}`);
      return data as VendorProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/product/create */
export const createProduct = createAsyncThunk(
  "vendorProducts/create",
  async (payload: Omit<VendorProduct, "id" | "createdAt">, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/product/create", payload);
      return data as VendorProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/product/update */
export const updateProduct = createAsyncThunk(
  "vendorProducts/update",
  async (payload: Partial<VendorProduct> & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/api/v1/product/update", payload);
      return data as VendorProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/product/delete */
export const softDeleteProduct = createAsyncThunk(
  "vendorProducts/softDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.patch("/api/v1/product/delete", { id });
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/vendor/delete/product/{id} */
export const vendorDeleteProduct = createAsyncThunk(
  "vendorProducts/vendorDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.patch(`/api/v1/vendor/delete/product/${id}`, {});
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/product/{id}/deactivate */
export const deactivateProduct = createAsyncThunk(
  "vendorProducts/deactivate",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/product/${id}/deactivate`, {});
      return data as VendorProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/product/{id}/reinstate */
export const reinstateProduct = createAsyncThunk(
  "vendorProducts/reinstate",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/v1/product/${id}/reinstate`, {});
      return data as VendorProduct;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ─── Helper ────────────────────────────────────────────────────────────────────

const syncProduct = (inventory: VendorProduct[], updated: VendorProduct) => {
  const idx = inventory.findIndex((p) => p.id === updated.id);
  if (idx !== -1) inventory[idx] = updated;
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const vendorProductsSlice = createSlice({
  name: "vendorProducts",
  initialState,
  reducers: {
    clearSelectedProduct(state) { state.selectedProduct = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchInventory
      .addCase(fetchVendorInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVendorInventory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.inventory = payload.products;
        state.total = payload.total;
      })
      .addCase(fetchVendorInventory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // fetchById
      .addCase(fetchVendorProductById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVendorProductById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedProduct = payload;
      })
      .addCase(fetchVendorProductById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // create
      .addCase(createProduct.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.inventory.unshift(payload);
        state.total += 1;
      })
      .addCase(createProduct.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })
      // update
      .addCase(updateProduct.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        syncProduct(state.inventory, payload);
        if (state.selectedProduct?.id === payload.id) state.selectedProduct = payload;
      })
      .addCase(updateProduct.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })
      // soft delete / vendor delete — remove from list
      .addCase(softDeleteProduct.fulfilled, (state, { payload }) => {
        state.inventory = state.inventory.filter((p) => p.id !== payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(vendorDeleteProduct.fulfilled, (state, { payload }) => {
        state.inventory = state.inventory.filter((p) => p.id !== payload);
        state.total = Math.max(0, state.total - 1);
      })
      // deactivate / reinstate — update status in list
      .addCase(deactivateProduct.fulfilled, (state, { payload }) => {
        syncProduct(state.inventory, payload);
        if (state.selectedProduct?.id === payload.id) state.selectedProduct = payload;
      })
      .addCase(reinstateProduct.fulfilled, (state, { payload }) => {
        syncProduct(state.inventory, payload);
        if (state.selectedProduct?.id === payload.id) state.selectedProduct = payload;
      });
  },
});

export const { clearSelectedProduct, clearError } = vendorProductsSlice.actions;
export default vendorProductsSlice.reducer;

export const selectVendorInventory = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.inventory;
export const selectSelectedVendorProduct = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.selectedProduct;
export const selectVendorProductsLoading = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.loading;
export const selectVendorProductsError = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.error;
export const selectVendorProductsTotal = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.total;
export const selectVendorProductsActionLoading = (s: { vendorProducts: VendorProductsState }) => s.vendorProducts.actionLoading;