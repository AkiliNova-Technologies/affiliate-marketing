// redux/slices/categoriesSlice.ts
// Endpoints:
//   GET    /api/v1/categories
//   GET    /api/v1/categories/{id}
//   POST   /api/v1/admin/category/create
//   PATCH  /api/v1/admin/category/edit/{id}
//   DELETE /api/v1/admin/category/delete/{id}

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  parentId?: string;
  createdAt?: string;
  [key: string]: any;
}

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  actionLoading: false,
};

/** GET /api/v1/categories */
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/categories");
      return (data.data || data.categories || data) as Category[];
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** GET /api/v1/categories/{id} */
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/categories/${id}`);
      return data as Category;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** POST /api/v1/admin/category/create */
export const createCategory = createAsyncThunk(
  "categories/create",
  async (
    payload: { name: string; description?: string; parentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/api/v1/admin/category/create", payload);
      return data as Category;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/admin/category/edit/{id} */
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, payload }: { id: string; payload: Partial<Category> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/category/edit/${id}`, payload);
      return data as Category;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** DELETE /api/v1/admin/category/delete/{id} */
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/category/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory(state) { state.selectedCategory = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload;
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchCategoryById.pending, (state) => { state.loading = true; })
      .addCase(fetchCategoryById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedCategory = payload;
      })
      .addCase(fetchCategoryById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createCategory.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createCategory.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.categories.push(payload);
      })
      .addCase(createCategory.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })
      .addCase(updateCategory.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        const idx = state.categories.findIndex((c) => c.id === payload.id);
        if (idx !== -1) state.categories[idx] = payload;
        if (state.selectedCategory?.id === payload.id) state.selectedCategory = payload;
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })
      .addCase(deleteCategory.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.categories = state.categories.filter((c) => c.id !== payload);
      })
      .addCase(deleteCategory.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearSelectedCategory, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;

export const selectCategories = (s: { categories: CategoriesState }) => s.categories.categories;
export const selectSelectedCategory = (s: { categories: CategoriesState }) => s.categories.selectedCategory;
export const selectCategoriesLoading = (s: { categories: CategoriesState }) => s.categories.loading;
export const selectCategoriesError = (s: { categories: CategoriesState }) => s.categories.error;
export const selectCategoriesActionLoading = (s: { categories: CategoriesState }) => s.categories.actionLoading;