// redux/hooks/useReduxMarketplace.ts
// Covers: GET /api/v1/marketplace/products

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchMarketplaceProducts,
  setFilters,
  clearFilters,
  selectMarketplaceProducts,
  selectMarketplaceLoading,
  selectMarketplaceTotal,
  selectMarketplacePage,
  selectMarketplaceFilters,
  type MarketplaceFilters,
} from "@/redux/slices/marketplaceSlice";

export function useReduxMarketplace() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectMarketplaceProducts);
  const loading = useAppSelector(selectMarketplaceLoading);
  const total = useAppSelector(selectMarketplaceTotal);
  const page = useAppSelector(selectMarketplacePage);
  const filters = useAppSelector(selectMarketplaceFilters);

  const loadProducts = useCallback(
    async (params?: MarketplaceFilters) => {
      try {
        return await dispatch(fetchMarketplaceProducts(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load marketplace products");
      }
    },
    [dispatch]
  );

  const applyFilters = useCallback(
    (newFilters: Partial<MarketplaceFilters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  return {
    products,
    loading,
    total,
    page,
    filters,
    loadProducts,
    applyFilters,
    resetFilters,
  };
}