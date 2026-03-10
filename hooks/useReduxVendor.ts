// redux/hooks/useReduxVendor.ts
// Covers all vendor product management endpoints

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchVendorInventory,
  fetchVendorProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  vendorDeleteProduct,
  deactivateProduct,
  reinstateProduct,
  clearSelectedProduct,
  selectVendorInventory,
  selectSelectedVendorProduct,
  selectVendorProductsLoading,
  selectVendorProductsError,
  selectVendorProductsTotal,
  selectVendorProductsActionLoading,
  type VendorProduct,
} from "@/redux/slices/vendorProductsSlice";

export function useReduxVendor() {
  const dispatch = useAppDispatch();

  const inventory = useAppSelector(selectVendorInventory);
  const selectedProduct = useAppSelector(selectSelectedVendorProduct);
  const loading = useAppSelector(selectVendorProductsLoading);
  const error = useAppSelector(selectVendorProductsError);
  const total = useAppSelector(selectVendorProductsTotal);
  const actionLoading = useAppSelector(selectVendorProductsActionLoading);

  // ── Inventory ───────────────────────────────────────────────────────────────

  const loadInventory = useCallback(
    async (params?: Parameters<typeof fetchVendorInventory>[0]) => {
      try {
        return await dispatch(fetchVendorInventory(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load inventory");
      }
    },
    [dispatch]
  );

  const loadProductById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchVendorProductById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load product");
      }
    },
    [dispatch]
  );

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const addProduct = useCallback(
    async (payload: Parameters<typeof createProduct>[0]) => {
      try {
        const result = await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created and submitted for approval!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to create product");
        throw err;
      }
    },
    [dispatch]
  );

  const editProduct = useCallback(
    async (payload: Partial<VendorProduct> & { id: string }) => {
      try {
        const result = await dispatch(updateProduct(payload)).unwrap();
        toast.success("Product updated and queued for re-approval");
        return result;
      } catch (err: any) {
        toast.error(err || "Update failed");
        throw err;
      }
    },
    [dispatch]
  );

  const deleteProduct = useCallback(
    async (id: string, useVendorEndpoint = false) => {
      try {
        if (useVendorEndpoint) {
          await dispatch(vendorDeleteProduct(id)).unwrap();
        } else {
          await dispatch(softDeleteProduct(id)).unwrap();
        }
        toast.success("Product deleted");
      } catch (err: any) {
        toast.error(err || "Delete failed");
        throw err;
      }
    },
    [dispatch]
  );

  const deactivate = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(deactivateProduct(id)).unwrap();
        toast.success("Product deactivated");
        return result;
      } catch (err: any) {
        toast.error(err || "Deactivation failed");
        throw err;
      }
    },
    [dispatch]
  );

  const reinstate = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(reinstateProduct(id)).unwrap();
        toast.success("Product reinstated");
        return result;
      } catch (err: any) {
        toast.error(err || "Reinstatement failed");
        throw err;
      }
    },
    [dispatch]
  );

  const deselectProduct = useCallback(() => {
    dispatch(clearSelectedProduct());
  }, [dispatch]);

  return {
    inventory,
    selectedProduct,
    loading,
    error,
    total,
    actionLoading,
    loadInventory,
    loadProductById,
    addProduct,
    editProduct,
    deleteProduct,
    deactivate,
    reinstate,
    deselectProduct,
  };
}