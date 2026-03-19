// redux/hooks/useReduxCategories.ts
"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  clearSelectedCategory,
  clearError,
  selectCategories,
  selectSelectedCategory,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesActionLoading,
  type Category,
} from "@/redux/slices/categoriesSlice";

export function useReduxCategories(autoLoad = false) {
  const dispatch = useAppDispatch();

  const categories     = useAppSelector(selectCategories);
  const selected       = useAppSelector(selectSelectedCategory);
  const loading        = useAppSelector(selectCategoriesLoading);
  const error          = useAppSelector(selectCategoriesError);
  const actionLoading  = useAppSelector(selectCategoriesActionLoading);

  // ── Auto-load on mount if requested ────────────────────────────────────────
  useEffect(() => {
    if (autoLoad) {
      dispatch(fetchCategories());
    }
  }, [autoLoad, dispatch]);

  // ── Read ────────────────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      return await dispatch(fetchCategories()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load categories");
    }
  }, [dispatch]);

  const loadCategoryById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchCategoryById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load category");
      }
    },
    [dispatch],
  );

  // ── Write (admin-only) ──────────────────────────────────────────────────────

  const addCategory = useCallback(
    async (payload: { name: string; description?: string; parentId?: string }) => {
      try {
        const result = await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created successfully");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to create category");
        throw err;
      }
    },
    [dispatch],
  );

  const editCategory = useCallback(
    async (id: string, payload: Partial<Category>) => {
      try {
        const result = await dispatch(updateCategory({ id, payload })).unwrap();
        toast.success("Category updated successfully");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to update category");
        throw err;
      }
    },
    [dispatch],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        toast.success("Category deleted successfully");
      } catch (err: any) {
        toast.error(err || "Failed to delete category");
        throw err;
      }
    },
    [dispatch],
  );

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const deselectCategory = useCallback(() => {
    dispatch(clearSelectedCategory());
  }, [dispatch]);

  const clearCategoryError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /** Returns category name for a given id, or the id itself as fallback */
  const getCategoryLabel = useCallback(
    (id: string) => categories.find((c) => c.id === id)?.name ?? id,
    [categories],
  );

  /** Formatted options for <select> / <Select> components */
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return {
    // State
    categories,
    categoryOptions,
    selected,
    loading,
    actionLoading,
    error,

    // Read
    loadCategories,
    loadCategoryById,

    // Write
    addCategory,
    editCategory,
    removeCategory,

    // Helpers
    deselectCategory,
    clearError: clearCategoryError,
    getCategoryLabel,
  };
}